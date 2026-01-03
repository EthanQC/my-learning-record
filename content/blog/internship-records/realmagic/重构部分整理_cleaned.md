# 主 Agent 重构 —— 编排器 + Workflow + 工具化
## 1. 重构背景与问题定义
### 1.1 原始架构

**完整链路**：
```
客户端 → WebSocket → 主Agent接口 → 解析音频/图片 → 主Agent识别意图 
       → HTTP自调用子Agent → 子Agent执行逻辑 → 子Agent直接返回结果并修改状态
```

**核心问题：主 Agent 直接全权负责路由决策**

- 从 shortMemory（本地缓存，未引入 Redis）读取用户上下文
- 状态定义简单：`idle`、`pre_agent_name`、`doing_agent_name`
- 子 Agent 自行将状态修改回 idle，主 Agent 不负责状态闭环

主 Agent 调用 qwen3-max 模型，输出示例：

```json
{
    "recognition": "识别到用户想要批改作业",
    "intention": "用户意图是获取作业批改结果",
    "decision": "切换到批改状态并调用批改 Agent",
    "Agent_calling_protocol": ["homework_correct", "learning_progress"],
    "new_state": "correct_homework"
}
```

### 1.2 存在的问题

| 问题类别 | 具体表现 |
|---------|---------|
| **性能差** | 简单输入也需要主 Agent 做完整决策，响应延迟高；Agent 间 HTTP 自调用开销大 |
| **可维护性差** | 主 Agent 单文件上千行，新增场景需要在同一函数加多段逻辑 |
| **扩展性差** | 新增业务场景需改主 Agent + 多个子 Agent；无法配置化上线新场景 |
| **状态混乱** | 主/子 Agent 都可修改状态，易不一致；状态分散在本地缓存、数据库多处 |
| **可观测性差** | 完整流程涉及多接口，难追踪；日志、错误处理不统一 |

---

## 2. 重构目标与整体方案

### 2.1 核心目标

1. **职责解耦**：路由决策、业务调度、具体实现彻底分离
2. **状态统一**：建立统一会话状态模型，支持跨轮对话、场景切换与恢复
3. **可观测性**：统一响应结构、日志与 trace_id
4. **可扩展性**：新增场景只需定义 Workflow + 注册工具

### 2.2 架构设计（三层解耦）

```
┌─────────────────────────────────────────────────────────────┐
│                      编排器层 (Orchestrator)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ StateStore  │  │ Guardrails  │  │ WorkflowExecutor    │  │
│  │ (Redis状态) │  │ (决策中心)   │  │ (工作流分发)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      工作流层 (Workflow)                      │
│  ┌─────────────────┐          ┌─────────────────────────┐   │
│  │ ChatWorkflow    │          │ RecitationWorkflow      │   │
│  │ idle→clarify→   │          │ idle→listening→done     │   │
│  │ handoff_wait    │          │                         │   │
│  └─────────────────┘          └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      工具层 (Agent Tools)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐     │
│  │ 主Agent    │  │ 聊天Agent  │  │ 背诵Agent          │     │
│  │ 意图分类   │  │ chat/      │  │ compare-evaluate/  │     │
│  │            │  │ clarify    │  │ memory-tips/...    │     │
│  └────────────┘  └────────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 完整调用链路

```
Client (WebSocket)
    │
    ▼
/api/orchestrator/process          ← 统一入口
    │
    ├─→ InputParser.parse()        ← 解析输入（音频/图片/文本）
    │
    ├─→ StateStore.get()           ← 获取Redis状态（自动验证、跨天重置）
    │
    ├─→ agent_caller.classify_intent()  ← 主Agent意图分类（快速，只分类不决策）
    │
    ├─→ GuardrailsEngine.decide()  ← 护栏决策（基于评分做路由）
    │       ├─ 输入合法性检查
    │       ├─ pending TTL 维护
    │       └─ 生成 GuardDecision: continue/switch/exit/reject
    │
    ├─→ 执行决策
    │       ├─ switch  → 切换场景 → WorkflowExecutor
    │       ├─ exit    → 退出到 chat
    │       ├─ continue → WorkflowExecutor
    │       └─ reject  → 拒绝请求
    │
    ├─→ WorkflowExecutor.execute_scene_workflow()
    │       ├─ ChatWorkflow (idle/clarify/handoff_wait)
    │       └─ RecitationWorkflow (idle/listening/done)
    │
    ├─→ ResponseBuilder.text/voice/card()  ← 构建统一响应
    │
    └─→ WebSocket 推送 + HTTP 返回
```

---

## 3. 核心组件实现

### 3.1 编排器 (OrchestratorService)

**文件位置**: `src/core/orchestrator/orchestrator_service.py`

**职责**:
- 统一入口，协调所有组件
- 调用主 Agent 进行意图分类
- 通过 Guardrails 做路由决策
- 调用 WorkflowExecutor 执行业务逻辑

**核心函数**:

```python
async def process(self, user_id, session_id, input_data, trace_id) -> OrchestratorResponse:
    # 1. 解析输入
    context = await InputParser.parse(input_data)
    
    # 2. 获取会话状态（自动验证、跨天重置）
    current_state = await self.state_store.get(user_id, session_id)
    
    # 3. 主 Agent 意图分类（只分类，不决策）
    intent_result = await self.agent.classify_intent(user_input, active_scene, ...)
    
    # 4. Guardrails 决策
    decision = await self.guardrails.decide(user_input, agent_intent, current_state)
    
    # 5. 执行决策（switch/continue/exit/reject）
    if decision.action == "switch":
        await self.state_store.update_scene(user_id, session_id, new_scene)
        return await self._process_in_scene(...)
    # ...
```

### 3.2 护栏引擎 (GuardrailsEngine)

**文件位置**: `src/core/orchestrator/guardrails/guardrails_engine.py`

**设计理念**:
- **信任模型评分**：主 Agent 给出 0-100 分，Guardrails 映射为置信度
- **职责分离**：主 Agent 只分类 + 评分，Guardrails 做校验 + 决策
- **场景切换谨慎**：中置信度时设置 pending，需二次确认

**置信度映射**:

```python
@property
def confidence_level(self) -> Confidence:
    if self.score >= 75:
        return Confidence.HIGH    # 高置信度：直接执行
    elif self.score >= 50:
        return Confidence.MID     # 中置信度：设置pending，等确认
    else:
        return Confidence.LOW     # 低置信度：保守，继续当前
```

**决策逻辑**:

| 置信度 | 目标=当前场景 | 目标≠当前场景 |
|--------|--------------|--------------|
| HIGH   | continue     | switch（直接切换）|
| MID    | continue     | 设置 pending_switch，等确认 |
| LOW    | continue     | continue（保守策略）|

**pending_switch 机制**:

```python
@dataclass
class PendingSwitch:
    target: str           # 目标场景
    slots: Dict           # 槽位信息
    age_turns: int = 0    # 已等待轮次（超过3轮自动失效）
```

- 中置信度识别到切换意图 → 设置 pending
- 下一轮用户确认（HIGH/确认词）→ 执行切换
- 用户高置信度指向其他场景 → 放弃原 pending
- 超过 `PENDING_TTL_TURNS=3` 轮 → 自动失效

### 3.3 状态管理 (StateStore + SessionState)

**文件位置**: 
- `src/core/orchestrator/state/state_store.py`
- `src/core/orchestrator/state/session_state.py`

**统一状态模型**:

```python
@dataclass
class SessionState:
    user_id: int
    session_id: str
    active_scene: ActiveScene           # chat | recite | homework
    scene_state: Dict[str, Any]         # 场景内部状态（phase、learning_schedule等）
    pending_switch: Optional[PendingSwitch]  # 待确认的场景切换
    ttl_deadline: Optional[int]         # 场景粘滞截止时间
    last_intent: Optional[LastIntent]   # 上一次意图
    last_activity: str                  # 最后活动时间
```

**状态管理策略**:

| 策略 | 触发条件 | 处理方式 |
|------|---------|---------|
| 跨天重置 | `updated_at.date() != today` | 重置到 chat，清空 learning_schedule |
| 超时重置 | 非 chat 场景 + 10分钟无活动 | 重置到 chat，保留 learning_schedule |
| 启动清理 | 程序重启 | 扫描所有 session:* 键，执行验证重置 |

**Redis 存储**:
- Key: `session:{user_id}:{session_id}`
- TTL: 24小时
- 上下文历史: `context_history:{user_id}`，最多保留5条

### 3.4 工作流执行器 (WorkflowExecutor)

**文件位置**: `src/core/workflow/workflow_executor.py`

**职责**: 根据场景分发到对应的工作流

```python
async def execute_scene_workflow(self, scene, user_id, session_id, ...):
    if scene == "chat":
        return await self.chat_workflow.execute(...)
    elif scene == "recite":
        return await self.recitation_workflow.execute(...)
    elif scene == "homework":
        # TODO: 作业场景未实现
        return {"success": False, "error": "Homework workflow not implemented"}
```

### 3.5 聊天工作流 (ChatWorkflow)

**文件位置**: `src/core/workflow/chat_workflow.py`

**状态机**:

```
idle ←→ clarify ←→ handoff_wait
```

| Phase | 职责 | 下一状态 |
|-------|------|---------|
| idle | 正常对话，支持工具调用 | clarify（需澄清）/ handoff_wait（有pending） |
| clarify | 意图澄清 | idle / handoff_wait |
| handoff_wait | 等待场景切换确认 | idle（取消）/ 切换场景（确认）|

### 3.6 背诵工作流 (RecitationWorkflow)

**文件位置**: `src/core/workflow/recitation_workflow.py`

**状态机**:

```
idle → listening → done → idle
```

| Phase | 职责 | 核心逻辑 |
|-------|------|---------|
| idle | 初始化、获取材料、判断意图 | 从 learning_schedule 提取背诵任务；调用模型判断是否背诵意图 |
| listening | 执行背诵核心逻辑 | 判断是否背诵内容 → 调用 compare_and_evaluate → 保存历史 → 生成记忆技巧 |
| done | 完成处理 | 保存记录、控制硬件（跳舞/微笑）|

**业务规则常量**:
```python
PASS_THRESHOLD = 85.0   # 达标阈值
MAX_ROUNDS = 3          # 最大背诵轮次
```

### 3.7 Agent 调用器 (AgentCaller)

**文件位置**: `src/core/tools/agent_caller.py`

**职责**: 封装对各 Agent 工具化接口的 HTTP 调用

**调用方式**:
```python
# 通用调用
result = await agent_caller.call("recitation", "compare-and-evaluate", payload)

# 语义化封装
result = await agent_caller.classify_intent(user_input, active_scene, ...)
result = await agent_caller.chat(user_id, session_id, text, context, tools)
result = await agent_caller.compare_and_evaluate(expected_text, user_text)
result = await agent_caller.generate_memory_tips(user_id, errors)
```

**容错机制**:
```python
async def classify_intent(...):
    try:
        result = await self.call("learning-companion", "classify-intent", {...})
        return result
    except Exception as e:
        # LLM API 失败时，返回保守默认策略
        return {
            "intent": "continue_current",
            "score": 50,
            "reason": "意图分类失败，默认继续当前场景"
        }
```

---

## 4. Agent 工具化改造

### 4.1 改造原则

- **原子化**：一个接口只做一件事
- **无状态**：Agent 不持有业务状态，所有数据由调用方传入
- **内部调用 LLM**：工具内部封装模型调用，对外暴露简单接口

### 4.2 主 Agent (learning-companion)

**文件位置**: `src/modules/agents/learning_companion/api/learning_companion_router.py`

| 接口 | 职责 |
|------|------|
| `POST /classify-intent` | 意图分类（只分类，不决策）|

**接口定义**:
```python
class IntentClassificationRequest(BaseModel):
    user_input: str
    active_scene: str
    pending_switch: Optional[Dict[str, Any]]
    user_id: int

class IntentClassificationResponse(BaseModel):
    intent: str      # chat/recite/homework/continue_current/exit_current
    score: int       # 0-100
    slots: Dict
    reason: str
```

### 4.3 聊天 Agent (chat-companion)

**文件位置**: `src/modules/agents/chat_companion/api/chat_companion_router.py`

| 接口 | 职责 | 对应 Phase |
|------|------|-----------|
| `POST /chat` | 正常对话（支持工具调用）| idle |
| `POST /clarify` | 意图澄清 | clarify |
| `POST /confirm-handoff` | 确认场景切换 | handoff_wait |

### 4.4 背诵 Agent (recitation)

**文件位置**: `src/modules/agents/recitation/api/recitation_router.py`

| 接口 | 职责 | 内部调用 LLM |
|------|------|-------------|
| `POST /analyze-idle-intent` | 分析 idle 状态用户意图 | ✅ |
| `POST /check-is-recitation-content` | 判断是否为背诵内容 | ✅ |
| `POST /compare-and-evaluate` | 对比文本并评估（核心）| ✅ |
| `POST /generate-memory-tips` | 生成记忆技巧 | ✅ |
| `POST /generate-standard-answer` | 生成标准答案 | ✅ |
| `POST /save-history` | 保存背诵历史 | ❌ |

---

## 5. 统一响应结构

**文件位置**: `src/core/orchestrator/response_builder.py`

```python
@dataclass
class OrchestratorResponse:
    success: bool
    content: ResponseContent      # text/voice/card
    trace_id: str                 # 链路追踪
    session_id: str
    scene: str                    # 当前场景
    phase: str                    # 当前阶段
    suggested_actions: List[str]  # 建议下一步
    need_tts: bool               # 是否需要语音合成
    error: Optional[str]
    processing_time_ms: int
    timestamp: datetime
```

---

## 6. 重构进度与成果

### 6.1 已完成

| 模块 | 状态 | 文件位置 |
|------|------|---------|
| 编排器 (Orchestrator) | ✅ 完成 | `src/core/orchestrator/orchestrator_service.py` |
| 护栏引擎 (Guardrails) | ✅ 完成 | `src/core/orchestrator/guardrails/guardrails_engine.py` |
| 状态管理 (StateStore) | ✅ 完成 | `src/core/orchestrator/state/state_store.py` |
| 工作流执行器 | ✅ 完成 | `src/core/workflow/workflow_executor.py` |
| 聊天工作流 | ✅ 完成 | `src/core/workflow/chat_workflow.py` |
| 背诵工作流 | ✅ 完成 | `src/core/workflow/recitation_workflow.py` |
| 主 Agent 工具化 | ✅ 完成 | `src/modules/agents/learning_companion/` |
| 聊天 Agent 工具化 | ✅ 完成 | `src/modules/agents/chat_companion/` |
| 背诵 Agent 工具化 | ✅ 完成 | `src/modules/agents/recitation/` |

### 6.2 未完成

| 模块 | 状态 | 说明 |
|------|------|------|
| 作业工作流 | ❌ 未开始 | 离职前未推进 |
| 作业相关 Agent 工具化 | ❌ 未开始 | homework_correct/tutor/summary 等 |

---

## 7. 面试可能追问

### Q1: 为什么要三层架构（编排器-工作流-工具）而不是二层？

**回答思路**:
- 二层方案：编排器直接调用 Agent 工具 → 编排器会变得臃肿，需要处理各场景的状态机逻辑
- 三层方案的好处：
  - **编排器**只关心"调哪个工作流"，不关心场景内部细节
  - **工作流**负责场景内状态机和业务编排，职责清晰
  - **新增场景**：只需新建 Workflow 文件 + 注册到 WorkflowExecutor，不改编排器

### Q2: 主 Agent 和 Guardrails 的职责分离是什么？为什么这样设计？

**回答思路**:
- **主 Agent**：纯分类器，输入用户文本 → 输出意图 + 评分，不做任何决策
- **Guardrails**：决策中心，基于评分 + 当前状态 → 决定 continue/switch/exit/reject
- **为什么分离**：
  - 分类和决策是两个独立关注点，分离后各自可以独立优化
  - 分类可以换模型、换 prompt，不影响决策逻辑
  - 决策规则（如 pending 机制）可以调整，不需要改 prompt

### Q3: pending_switch 机制解决了什么问题？

**回答思路**:
- **问题**：模型中置信度时，直接切换可能误判；不切换又可能错过真实意图
- **解决**：设置 pending，等下一轮用户确认
- **细节**：
  - 中置信度 → 设置 pending，返回"你是想xxx吗？"
  - 用户确认 → 执行切换
  - 用户否认或超时（3轮）→ 清除 pending

### Q4: 状态管理为什么要引入 Redis？跨天重置是怎么实现的？

**回答思路**:
- **为什么 Redis**：
  - 原方案用本地缓存，多实例部署会状态不一致
  - Redis 支持 TTL 自动过期，简化清理逻辑
- **跨天重置**：
  - 每次 `StateStore.get()` 时检查 `updated_at.date() != today`
  - 如果跨天，调用 `StateValidator.validate_and_reset_if_needed()` 重置到 chat

### Q5: 如果这个系统要支持更多场景，你的设计还能复用吗？

**回答思路**:
- **新增场景步骤**：
  1. 新建 `XxxWorkflow` 类，定义状态机
  2. 在 `WorkflowExecutor` 注册
  3. 在 `GuardrailsEngine.AVAILABLE_SCENES` 添加
  4. 主 Agent prompt 增加新意图
- **可复用部分**：
  - 编排器、Guardrails、StateStore 完全复用
  - AgentCaller 通用调用逻辑复用
  - 统一响应结构复用

### Q6: 你参考了什么资料来设计这个架构？

**回答思路**:
- 参考了 Anthropic 的 "Building Effective Agents" 文章
- 核心理念：
  - Router 只做分类，不做决策
  - Guardrails 独立做决策
  - 不把所有事情都丢给大模型

### Q7: Agent 工具化的好处是什么？

**回答思路**:
- **解耦**：Agent 只暴露原子接口，不关心谁调用、什么场景
- **复用**：同一个工具可以被多个 Workflow 调用
- **测试**：可以单独测试每个工具，不需要启动完整流程
- **替换**：换模型只需改工具内部实现，不影响 Workflow

---

## 8. 代码文件速查表

| 组件 | 文件路径 |
|------|---------|
| 编排器入口 | `src/core/orchestrator/api/orchestrator_router.py` |
| 编排器服务 | `src/core/orchestrator/orchestrator_service.py` |
| 护栏引擎 | `src/core/orchestrator/guardrails/guardrails_engine.py` |
| 状态存储 | `src/core/orchestrator/state/state_store.py` |
| 状态模型 | `src/core/orchestrator/state/session_state.py` |
| 状态验证 | `src/core/orchestrator/state/state_validator.py` |
| 响应构建 | `src/core/orchestrator/response_builder.py` |
| 工作流执行器 | `src/core/workflow/workflow_executor.py` |
| 聊天工作流 | `src/core/workflow/chat_workflow.py` |
| 背诵工作流 | `src/core/workflow/recitation_workflow.py` |
| Agent 调用器 | `src/core/tools/agent_caller.py` |
| 主 Agent 路由 | `src/modules/agents/learning_companion/api/learning_companion_router.py` |
| 聊天 Agent 路由 | `src/modules/agents/chat_companion/api/chat_companion_router.py` |
| 背诵 Agent 路由 | `src/modules/agents/recitation/api/recitation_router.py` |
| 依赖注入 | `src/core/orchestrator/api/dependencies.py` |
