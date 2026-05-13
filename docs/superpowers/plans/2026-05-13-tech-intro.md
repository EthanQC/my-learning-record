# tech-intro 泛科普合集 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `content/tech-intro/` 下产出 10 篇面向无技术背景新人的泛科普文章，独立成书，深度比 `content/notes/` 浅 2~3 档。

**Architecture:** 每篇文章一个 markdown 文件，前缀数字固定文件系统顺序。前 8 篇重写自 `content/notes/` 已有素材（CS 基础），后 2 篇为新写（工程师工作侧）。每篇 1500~3000 字，使用专业术语但深度限制在"是什么/大致怎么工作/为什么需要"。

**Tech Stack:** Markdown + YAML frontmatter（与 `content/notes/` 一致）。

**Spec：** `docs/superpowers/specs/2026-05-13-tech-intro-design.md`

---

## File Structure

新建目录与文件：

```
content/tech-intro/
├── 01-program-runtime.md            # 程序是怎么跑起来的
├── 02-network.md                    # 网络是怎么把数据送到对方手里的
├── 03-database.md                   # 数据库都在做什么
├── 04-cache.md                      # 缓存为什么不可或缺
├── 05-data-structure-and-algorithm.md  # 数据结构与算法到底用在哪
├── 06-backend-service.md            # 后端服务长什么样
├── 07-frontend.md                   # 前端在做的事
├── 08-toolbox.md                    # 程序员的工具箱
├── 09-tech-roles.md                 # 技术团队里都有谁
└── 10-dev-lifecycle.md              # 一个功能是怎么从想法变成线上服务的
```

不修改任何已有文件。

---

## 全局约定（每个 Task 都要遵守）

**Frontmatter 模板**（每篇文件第一段必须是这个）：

```yaml
---
title: <文章标题>
date: 2026-05-13
tags:
  - tech-intro
summary: <一句话摘要，<= 80 字，纯文本无 markdown 标记>
---
```

**写作风格硬约束（验收清单）：**
1. 全文 1500~3000 字（含标题，不含 frontmatter）。
2. 无任何代码块（```...```），无伪代码，无 ASCII 状态图/序列图。允许行内 `code` 标记单个术语。
3. 第一次出现的专业术语必须用一句话点明含义，例：「TCP（一种保证数据按顺序、完整送达的网络协议）」。后续出现不再解释。
4. 不出现"想象一下你点了一杯奶茶"这类生活化叙事壳子；不刻意把术语翻译成生活比喻。
5. 不引用 `content/notes/` 内任何文件路径；不写"想深入看 xx.md"。
6. 章节小标题 2~5 个，使用 `##` 二级标题。
7. 没有"总结""结语""参考资料"段落。结尾自然收住即可。

**每个 Task 的标准步骤（template）：**

每个 Task 都按下列 6 步执行；详见 Task N 内的填充内容。

- 步骤 1：阅读源材料（Task 内列出的现有笔记路径）
- 步骤 2：列出本篇大纲（4~6 个二级标题）
- 步骤 3：写完整文章正文（含 frontmatter）
- 步骤 4：本地自查验收清单（上面 7 条）
- 步骤 5：写入文件
- 步骤 6：commit

**通用 commit 命令：**

```bash
git add content/tech-intro/<filename>.md
git commit -m "docs(tech-intro): 新增 <章节序号> <标题>"
```

---

## Task 1: 第 01 篇 · 程序是怎么跑起来的

**Files:**
- Create: `content/tech-intro/01-program-runtime.md`

**主题边界：** 进程/线程/内存/CPU 的分工；程序从源码（写出来的代码）到可执行文件再到运行的链路概述；为什么会有"多任务"。

**不要写：** 具体调度算法、PCB 数据结构、虚拟内存分页机制、汇编/链接细节。

- [ ] **Step 1: 阅读源材料**

```bash
cat content/notes/other/os-fundamentals.md
ls content/notes/interview-questions/operation-system/
cat content/notes/interview-questions/operation-system/fundamentals.md
cat content/notes/interview-questions/operation-system/processes-threads-mutual-exclusion-and-synchronization.md
cat content/notes/interview-questions/operation-system/memory-management.md
```

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 一段代码到底是怎么变成程序在跑的（源码→编译/解释→可执行→加载到内存→CPU 执行）
2. 进程与线程：操作系统怎么"同时"跑多个东西
3. 内存：程序的工作空间（栈/堆的直观含义，不展开实现）
4. CPU 怎么决定先做谁（多任务的直观含义，不讲算法）
5. 为什么不能让程序自己管所有事（操作系统的角色）

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 程序是怎么跑起来的
date: 2026-05-13
tags:
  - tech-intro
summary: 一段代码从写出来到在 CPU 上运行，中间经过编译、加载、调度等环节；操作系统负责管这些事
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/01-program-runtime.md`（中文 1 字符 ≈ 1 字）
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："进程""线程""内存""CPU""操作系统""编译"）
4. 无生活化叙事壳子（如"想象你点了奶茶"）
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/01-program-runtime.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/01-program-runtime.md
git commit -m "docs(tech-intro): 新增 01 程序是怎么跑起来的"
```

---

## Task 2: 第 02 篇 · 网络是怎么把数据送到对方手里的

**Files:**
- Create: `content/tech-intro/02-network.md`

**主题边界：** IP、端口、DNS、HTTP/HTTPS、TCP 大致工作方式；URL 到响应的链路概述。

**不要写：** TCP 三次握手/四次挥手的字段细节、拥塞控制算法、TLS 握手详细步骤、OSI 七层每层都讲一遍。

- [ ] **Step 1: 阅读源材料**

```bash
ls content/notes/interview-questions/computer-network/
ls content/notes/interview-questions/computer-network/fundamentals/
ls content/notes/interview-questions/computer-network/application-layer/
ls content/notes/interview-questions/computer-network/transport-layer/
```

挑代表性的 1~2 篇详读，其余浏览标题。

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 两台机器要通信，至少要解决哪些问题（找到对方、找到对方的具体程序、保证内容送到）
2. IP 与端口：找人和敲门
3. DNS：把人话域名翻译成 IP
4. HTTP / HTTPS：浏览器和服务器之间在说什么
5. TCP（与 UDP）大致区别：保证送达 vs 尽力而为

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 网络是怎么把数据送到对方手里的
date: 2026-05-13
tags:
  - tech-intro
summary: 互联网通信要解决「找到对方」「找到对方的具体程序」「内容可靠送达」三件事，IP、端口、DNS、TCP、HTTP 各自负责其中一块
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/02-network.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："IP""端口""DNS""HTTP""HTTPS""TCP""UDP""协议"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/02-network.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/02-network.md
git commit -m "docs(tech-intro): 新增 02 网络是怎么把数据送到对方手里的"
```

---

## Task 3: 第 03 篇 · 数据库都在做什么

**Files:**
- Create: `content/tech-intro/03-database.md`

**主题边界：** 关系型 vs 非关系型；SQL 是什么；索引为什么能加速查询（不讲 B+ 树结构）；事务大致含义（ACID 一句话带过）。

**不要写：** B+ 树/B 树/哈希索引内部结构、MVCC 实现、锁机制细节、SQL 优化技巧。

- [ ] **Step 1: 阅读源材料**

```bash
cat content/notes/database/FAQ.md
cat content/notes/database/common-operations.md
ls content/notes/interview-questions/mysql/
ls content/notes/interview-questions/mysql/fundamentals/
ls content/notes/interview-questions/mysql/index/
ls content/notes/interview-questions/mysql/transaction/
```

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 为什么不用 Excel 存所有数据：数据库要解决什么问题
2. 关系型数据库与表的概念
3. SQL：一种和数据库对话的语言
4. 索引：为什么查询能变快
5. 事务：要么全做完，要么全不做
6. 关系型之外：非关系型数据库简介

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 数据库都在做什么
date: 2026-05-13
tags:
  - tech-intro
summary: 数据库是结构化存储和高效查询数据的工具，关系型用表与 SQL 表达数据关系，索引让查询变快，事务保证一组操作的原子性
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/03-database.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："关系型数据库""非关系型数据库""SQL""表""索引""事务""ACID"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/03-database.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/03-database.md
git commit -m "docs(tech-intro): 新增 03 数据库都在做什么"
```

---

## Task 4: 第 04 篇 · 缓存为什么不可或缺

**Files:**
- Create: `content/tech-intro/04-cache.md`

**主题边界：** 缓存的角色；Redis 是什么；缓存命中/失效/过期淘汰直观含义；为什么不能"所有东西都放缓存"。

**不要写：** Redis 数据结构内部实现（跳表/SDS 等）、持久化 RDB/AOF 细节、集群模式细节。

- [ ] **Step 1: 阅读源材料**

```bash
cat content/notes/redis/fundamentals.md
ls content/notes/interview-questions/redis/
cat content/notes/interview-questions/redis/fundamentals/*.md 2>/dev/null | head -200
cat content/notes/interview-questions/redis/memory.md
```

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 为什么需要缓存：内存与磁盘的速度差距
2. Redis 是什么、为什么常被当缓存
3. 缓存命中与未命中
4. 过期与淘汰：缓存放不下了怎么办
5. 缓存不是免费的：一致性问题简介（为什么数据可能"看起来旧"）

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 缓存为什么不可或缺
date: 2026-05-13
tags:
  - tech-intro
summary: 内存比磁盘快几个数量级，缓存就是把高频访问的数据先放内存，Redis 是最常见的缓存系统；但缓存会带来一致性与淘汰策略的取舍
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/04-cache.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："缓存""Redis""内存""命中""失效""淘汰""一致性"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/04-cache.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/04-cache.md
git commit -m "docs(tech-intro): 新增 04 缓存为什么不可或缺"
```

---

## Task 5: 第 05 篇 · 数据结构与算法到底用在哪

**Files:**
- Create: `content/tech-intro/05-data-structure-and-algorithm.md`

**主题边界：** 数组/链表/哈希表/树/图各自的常见使用场景；算法是什么、为什么有"复杂度"概念（一句话带过 O(n) 之类，不展开）。

**不要写：** 时间复杂度证明、具体排序算法实现、二叉搜索树/平衡树的旋转、动态规划/回溯的解题套路。

- [ ] **Step 1: 阅读源材料**

```bash
ls content/notes/data-structure-and-algorithm/data-structure/
cat content/notes/data-structure-and-algorithm/data-structure/array.md
cat content/notes/data-structure-and-algorithm/data-structure/linked-list.md
cat content/notes/data-structure-and-algorithm/data-structure/hash-table.md
cat content/notes/data-structure-and-algorithm/data-structure/binary-tree.md
cat content/notes/data-structure-and-algorithm/algorithm-analysis/time-and-space-complexity.md
```

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 数据结构是什么：组织数据的方式决定了能干嘛
2. 数组与链表：连续与跳转的取舍
3. 哈希表：为什么能"瞬间"找到一个东西
4. 树与图：现实世界的层级和关系
5. 算法与复杂度：同一件事可以快也可以慢，差距能差几万倍

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 数据结构与算法到底用在哪
date: 2026-05-13
tags:
  - tech-intro
summary: 数据结构是组织数据的方式，决定了能做什么、做得快不快；算法是处理数据的步骤，复杂度衡量它的快慢——这两件事决定了一个程序好不好
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/05-data-structure-and-algorithm.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："数据结构""算法""数组""链表""哈希表""树""图""复杂度"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/05-data-structure-and-algorithm.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/05-data-structure-and-algorithm.md
git commit -m "docs(tech-intro): 新增 05 数据结构与算法到底用在哪"
```

---

## Task 6: 第 06 篇 · 后端服务长什么样

**Files:**
- Create: `content/tech-intro/06-backend-service.md`

**主题边界：** API 是什么；服务器（不只是机器，还是跑在机器上的程序）；负载均衡；微服务为什么要拆；高可用直观含义。

**不要写：** 具体 REST/gRPC 协议细节、服务发现/注册中心实现、Kubernetes/容器编排深水区、分布式事务。

- [ ] **Step 1: 阅读源材料**

```bash
cat content/notes/back-end/muduo.md
ls content/notes/interview-questions/microservices-and-cloud-native/
cat content/notes/interview-questions/microservices-and-cloud-native/*.md 2>/dev/null | head -300
```

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 后端服务做什么：前端能看到的功能背后谁在干活
2. API：服务对外提供能力的接口
3. 服务器：硬件还是软件
4. 一台机器扛不住时：负载均衡与多实例
5. 单体服务到微服务：拆开各自管一摊
6. 高可用：怎么让用户感觉不到故障

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 后端服务长什么样
date: 2026-05-13
tags:
  - tech-intro
summary: 后端服务是用户看不到的那一半，对外通过 API 提供能力；当一台机器扛不住，需要负载均衡、多实例和微服务架构来扩展和保持可用
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/06-backend-service.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："API""服务器""负载均衡""微服务""单体""高可用"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/06-backend-service.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/06-backend-service.md
git commit -m "docs(tech-intro): 新增 06 后端服务长什么样"
```

---

## Task 7: 第 07 篇 · 前端在做的事

**Files:**
- Create: `content/tech-intro/07-frontend.md`

**主题边界：** HTML/CSS/JS 各自的角色；浏览器打开一个网页大致做了哪些事；SPA 是什么；组件化思想。

**不要写：** 具体框架对比（Vue/React/Angular）、CSS 选择器优先级、JS 事件循环细节、Webpack/Vite 构建机制。

- [ ] **Step 1: 阅读源材料**

```bash
ls content/notes/front-end/
ls content/notes/front-end/HTML/
ls content/notes/front-end/React/
cat content/notes/front-end/1.md 2>/dev/null
```

如果素材薄，可以再扫一下 `content/blog/internship-records/` 里的前端相关内容作为补充语境。

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 前端在哪里跑：浏览器是前端的运行环境
2. HTML / CSS / JS 各自的角色
3. 浏览器打开一个网页时大致做了什么
4. 单页应用（SPA）与传统多页应用
5. 组件化：把界面切成可复用的积木

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 前端在做的事
date: 2026-05-13
tags:
  - tech-intro
summary: 前端代码在浏览器里跑，HTML 描述结构、CSS 描述样式、JS 描述行为；现代前端往单页应用与组件化方向演进，让复杂界面更易维护
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/07-frontend.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："HTML""CSS""JavaScript""浏览器""SPA""组件化"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/07-frontend.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/07-frontend.md
git commit -m "docs(tech-intro): 新增 07 前端在做的事"
```

---

## Task 8: 第 08 篇 · 程序员的工具箱

**Files:**
- Create: `content/tech-intro/08-toolbox.md`

**主题边界：** Git（版本控制是什么）；Linux 命令行（为什么程序员都用）；Docker / 容器（为什么需要"打包"）；CI/CD（让发布自动化）。

**不要写：** Git 内部对象模型、Linux 内核知识、Docker 底层 namespace/cgroup、具体 CI 工具配置语法。

- [ ] **Step 1: 阅读源材料**

```bash
cat content/notes/git/fundamentals.md
cat content/notes/git/common-operations.md
cat content/notes/Linux/common-instructions.md
cat content/notes/Linux/file-pkg-management-tools.md
```

Docker / CI/CD 没有现成笔记，凭通识写。

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 版本控制：Git 在解决什么问题
2. Linux 命令行：图形界面不够用的地方
3. 容器与 Docker：把程序连同环境一起打包
4. CI/CD：让代码自动测试和发布

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 程序员的工具箱
date: 2026-05-13
tags:
  - tech-intro
summary: Git 管代码版本、Linux 命令行操控服务器、Docker 把程序和环境一起打包、CI/CD 让发布自动化——这四样几乎是每个开发者每天都接触的基础设施
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/08-toolbox.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："版本控制""Git""Linux""命令行""容器""Docker""CI/CD"）
4. 无生活化叙事壳子
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/08-toolbox.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/08-toolbox.md
git commit -m "docs(tech-intro): 新增 08 程序员的工具箱"
```

---

## Task 9: 第 09 篇 · 技术团队里都有谁

**Files:**
- Create: `content/tech-intro/09-tech-roles.md`

**主题边界：** 前端 / 后端 / 客户端 / 测试 / 运维 / SRE / DBA / 算法 / 数据 各自做什么、为什么需要这么多分工；技术负责人与架构师做什么。

**不要写：** 早九晚九这种作息细节、各家公司的具体职级体系、薪资范围。

- [ ] **Step 1: 阅读源材料（语境）**

```bash
ls content/blog/internship-records/
ls content/blog/interview-experiences/
```

仅作为写作时的语境参考（让描述贴近真实工程团队），成文中不引用任何路径。

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 为什么不能一个人写完一个产品
2. 产品形态侧：前端 / 后端 / 客户端 / 算法
3. 质量与稳定侧：测试 / 运维 / SRE / DBA
4. 数据侧：数据开发 / 数据分析
5. 横向角色：技术负责人 / 架构师 / 技术管理者

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 技术团队里都有谁
date: 2026-05-13
tags:
  - tech-intro
summary: 一个产品从前端界面到后端服务、稳定运行、数据沉淀，需要不同侧重的工程师分工；除了开发角色，还有测试、运维、SRE、DBA、数据、架构等横向角色
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查(逐项确认)**

1. 字数 1500~3000：`wc -m content/tech-intro/09-tech-roles.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："前端工程师""后端工程师""客户端工程师""测试工程师""运维工程师""SRE""DBA""算法工程师""数据工程师""架构师"）
4. 无生活化叙事壳子；不写早晚高峰、加班作息这种细节
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/09-tech-roles.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/09-tech-roles.md
git commit -m "docs(tech-intro): 新增 09 技术团队里都有谁"
```

---

## Task 10: 第 10 篇 · 一个功能是怎么从想法变成线上服务的

**Files:**
- Create: `content/tech-intro/10-dev-lifecycle.md`

**主题边界：** 需求 → 设计 → 开发 → Code Review → 测试 → 灰度 → 全量 → 监控 → 回滚 全流程概览；每一环大致谁来做、解决什么问题。

**不要写：** 敏捷开发的 ceremony 细节（站会怎么开）、具体监控工具产品对比、具体的代码评审打分标准。

- [ ] **Step 1: 阅读源材料（语境）**

```bash
ls content/blog/internship-records/
ls content/blog/interview-experiences/
```

仅作语境，成文中不引用路径。

- [ ] **Step 2: 列大纲**

预期大纲（可微调）：
1. 想法到上线：粗略的全流程地图
2. 需求与设计：在动手前讲清楚要做什么、怎么做
3. 开发与 Code Review：写代码与互相检查
4. 测试：把可能出错的地方提前找出来
5. 上线：灰度发布与全量发布
6. 上线之后：监控、告警、回滚

- [ ] **Step 3: 写完整文章**

Frontmatter：
```yaml
---
title: 一个功能是怎么从想法变成线上服务的
date: 2026-05-13
tags:
  - tech-intro
summary: 一个功能从产品提需求到上线通常经过设计、开发、Code Review、测试、灰度、全量、监控、回滚等环节，每一环各有分工和要解决的问题
---
```

正文按大纲写，1500~3000 字。

- [ ] **Step 4: 自查（逐项确认）**

1. 字数 1500~3000：`wc -m content/tech-intro/10-dev-lifecycle.md`
2. 无三引号代码块、无伪代码、无 ASCII 图
3. 首次出现术语有一句话点明（本篇至少检查："需求""设计""Code Review""测试""灰度""全量""监控""回滚"）
4. 无生活化叙事壳子（不写"早上九点站会"等细节）
5. 不引用 `content/notes/` 内任何路径
6. `##` 二级标题 4~6 个
7. 无"总结/结语/参考"段

- [ ] **Step 5: 写入文件**

写到 `content/tech-intro/10-dev-lifecycle.md`。

- [ ] **Step 6: Commit**

```bash
git add content/tech-intro/10-dev-lifecycle.md
git commit -m "docs(tech-intro): 新增 10 一个功能是怎么从想法变成线上服务的"
```

---

## 最终交付验收

完成 10 个 Task 后：

- [ ] `ls content/tech-intro/` 看到 10 个 markdown 文件
- [ ] 每个文件首行是 `---` 且有完整 frontmatter
- [ ] 每个文件不含三引号代码块（执行 `grep -nF '```' content/tech-intro/*.md`，应无输出）
- [ ] 每个文件字数在 1500~3000（执行 `wc -m content/tech-intro/*.md`）
- [ ] git log 看到 10 个独立 commit
