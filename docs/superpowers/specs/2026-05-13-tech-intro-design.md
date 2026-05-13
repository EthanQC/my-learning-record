# 技术岗位通用泛科普内容 · 设计文档

日期：2026-05-13
负责人：@EthanQC

## 目标

在 `content/tech-intro/` 下产出一套面向"无技术背景新人"的泛科普文章合集，主要素材来源为本仓库 `content/notes/` 中已有的深度笔记，但深度大幅降低，让读者建立对技术岗位通用知识的初步认知。

## 受众

不限定具体类别，写一份兼顾以下几类人都能受益的通用版本：
- 刚入行/转码的程序员新人（缺乏行业 common sense）
- 技术团队里的非技术岗（产品/运营/设计/HR/销售）
- 完全外行的好奇者

## 写作风格

- **使用专业术语**：标题与正文直接用 "TCP""索引""进程""容器" 等行业标准术语，不用儿童化比喻或叙事壳子（如"一个请求的一生"这类叙事框架不要用）。
- **首次出现一句话点明**：术语第一次出现时用一句话简洁解释"它是什么"，不展开。
- **深度**：比现有 `content/notes/` 浅 2~3 档。讲"是什么""大致怎么工作""为什么需要它"，不讲"具体如何实现"。不出现源码、伪代码、复杂的状态图。
- **篇幅**：每篇 1500~3000 字，独立可读，无需依赖前后篇。
- **不交叉链接到 `notes/`**：泛科普合集独立成书，不引导读者跳到面试八股深水区。

## 目录位置

`content/tech-intro/`，与 `content/blog/`、`content/notes/` 平级。

```
content/
├── blog/
├── notes/
└── tech-intro/        # 新增
    ├── 01-program-runtime.md
    ├── 02-network.md
    ├── 03-database.md
    ├── 04-cache.md
    ├── 05-data-structure-and-algorithm.md
    ├── 06-backend-service.md
    ├── 07-frontend.md
    ├── 08-toolbox.md
    ├── 09-tech-roles.md
    └── 10-dev-lifecycle.md
```

文件名前缀数字仅用于在文件系统中固定顺序，不要求站点呈现时显式展示。

## 章节清单

### 第一部分 · 计算机基础知识（重写自现有笔记）

| 序号 | 标题（草案） | 核心内容 | 主要素材来源 |
|---|---|---|---|
| 01 | 程序是怎么跑起来的 | 进程、线程、内存、CPU 的分工；程序从源码到执行的链路概述 | `notes/other/os-fundamentals.md`、`notes/interview-questions/operation-system/` |
| 02 | 网络是怎么把数据送到对方手里的 | IP、端口、DNS、HTTP/HTTPS、TCP 大致工作方式 | `notes/interview-questions/computer-network/` |
| 03 | 数据库都在做什么 | 关系型 vs 非关系型、SQL 是什么、索引为什么有用、事务大致含义 | `notes/database/`、`notes/interview-questions/mysql/` |
| 04 | 缓存为什么不可或缺 | 缓存的角色、Redis 大致是什么、命中/失效/过期淘汰的直观含义 | `notes/redis/`、`notes/interview-questions/redis/` |
| 05 | 数据结构与算法到底用在哪 | 数组/链表/哈希/树/图各自的常见使用场景；不讲推导与复杂度证明 | `notes/data-structure-and-algorithm/` |
| 06 | 后端服务长什么样 | API 是什么、服务器、负载均衡、微服务、为什么要拆服务 | `notes/back-end/`、`notes/interview-questions/microservices-and-cloud-native/` |
| 07 | 前端在做的事 | HTML/CSS/JS 各自的角色、浏览器渲染流程概述、SPA、组件化 | `notes/front-end/` |
| 08 | 程序员的工具箱 | Git、Linux 命令行、Docker/容器、CI/CD 各自的作用 | `notes/git/`、`notes/Linux/` |

### 第二部分 · 工程师工作侧（新写）

| 序号 | 标题（草案） | 核心内容 |
|---|---|---|
| 09 | 技术团队里都有谁 | 前端/后端/客户端/测试/运维/SRE/DBA/算法/数据 各自做什么、为什么需要这么多分工 |
| 10 | 一个功能是怎么从想法变成线上服务的 | 需求→设计→开发→Code Review→测试→灰度→全量→监控→回滚 全流程概览 |

## 显式不做（out of scope）

- 第 09/10 篇按"团队里有哪些角色 / 一个功能上线要经过哪些环节"的事实陈述写，不写"早上九点打卡然后开会"这种纯生活叙事。
- 不写编程语言入门教程（不教 Go/JS/Python 语法）。
- 不写具体框架使用（Next.js/React/Gin/Spring 等不展开）。
- 不替换或改动 `content/notes/` 与 `content/blog/` 下任何已有文件。
- 不在 `tech-intro/` 内交叉引用 `content/notes/` 内的笔记（保持独立）。`content/blog/` 下的实习/面经素材作为写作时的私下参考来源是允许的，但成文里不放跳转链接。

## 完成标准

- `content/tech-intro/` 下 10 个 markdown 文件全部就位。
- 每篇带 frontmatter（与现有 notes 风格一致，可参考 `scripts/add-frontmatter.mjs`）。
- 每篇 1500~3000 字，未出现源码/伪代码/复杂示意图。
- 每篇首次出现术语处有一句话点明含义。
- 主题之间不交叉引用（彼此独立可读）。

## 风险与权衡

- **风格统一性**：10 篇分别写，容易在术语解释程度、段落长度上漂移。建议在写完第 01 篇后将其作为参考样本，后续按其风格对齐。
- **深度边界**：界定"什么算太深"是主观判断。本设计的具体卡点：不写源码、不写状态机/序列图，遇到"想展开讲"时停下来用一句话概括即可。
- **第 09/10 篇缺一手资料**：现有笔记没覆盖角色分工与开发流程，需要基于个人实习经验写。可以适度引用 `content/blog/internship-records/` 与 `content/blog/interview-experiences/` 里的真实场景作素材。
