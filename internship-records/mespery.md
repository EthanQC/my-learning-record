# 密纸科技
入职时间：2025.2.24

离职时间：2025.5.30

上班时间：第一周全勤，后面是周一周二周五上班

## 后端技术栈
公司业务是海外网文平台，我的岗位是后端开发，下面记录公司后端用到的一些技术工具

* 编程语言：php
* 框架：laravel + webman + GatewayWorker
* 数据库：MySQL
    * ORM：Eloquent ORM
    * 可视化：phpMyAdmin
    * 数据管理与图形化界面：SupMes
* 缓存：Redis
* 检索：Elasticsearch
* 接口文档管理：Apifox
* 代码评审和项目管理：Arcanist (arc，命令行工具) + Phabricator
* 仓库管理：GitBucket
* 环境管理：SPUG

## 我的工作
我的工作：

* 设计、开发、联调并上线新接口，写接口文档，跟前端协同确认需求
* 根据新需求维护和修改已有老接口，修复 bug
* 编写后端技术文档，梳理各个代码仓架构，便于新人入职后快速上手
* 参与公司研发会议，讨论技术选型的合理性和后端代码仓的复杂度
* 搭建新模块代码仓，设计架构
* 编写数据库字段批量修改脚本，修改资源 url

具体工作任务记录：

* **2025.2.24-2.28，3.3-3.4：熟悉仓库代码，看公司技术文档**
* **2025.3.7：修改一个任务模块的接口**
    * 新增“无时效任务”任务类型常量
    * 在原有的日常、周任务基础上新增“无时效任务”参数
    * 添加判断任务类型并根据任务类型设置任务结束时间的逻辑
    * 修改接口文档
    * 本地开发环境测试、提交 review 申请给 mentor
    * 上线测试环境
* **2025.3.7，3.10-3.11：编写返回书封书名的新接口**
    * 接口功能
        * 从 jwt 中间件获取的已认证的用户ID
        * 根据用户ID，在数据库中查询其近期阅读记录
        * 根据阅读记录查询用户最近阅读的一本书的封面和名字
        * 将数据返回给前端
    * 接口会返回的参数
        * resource_type：资源类型
        * resource_id：资源ID
        * chapter_id：章节ID
        * name：书名
        * cover_pic_url：书封
    * 参数数据结构
        * 加密后均为 string 类型
    * 接口编写逻辑（公司项目架构见下方）
        * 在项目框架路由文件中添加路由
        * Controller 层：响应函数，获取用户ID、调用 Service 层具体逻辑函数，校验获取的数据后返回
        * Service 层：业务逻辑函数，调用 Dao 层数据查询函数获取历史记录，格式化资源信息，处理章节ID获取最新记录，将所有数据转为 string 并加密后返回
        * Dao 层：数据查询函数，ORM 查询数据后返回
    * 编写接口文档，设计数据结构，跟前端对需求
    * 本地开发环境测试、提交 review 申请给 mentor
    * 上线测试环境
    * **难点：**
        **1. 不熟悉 php 技术栈，对仓库中封装好的数据加密和格式化的工具函数看不懂该如何调用**
        * 用 copilot、chatgpt 等工具查资料，了解工具后再使用，再让它们帮忙分析仓库结构、梳理需求逻辑，再不行就请教 mentor，最终成功使用

        **2. 第一次在企业级项目中自己从零开始写接口，缺乏经验，不确定具体该如何设计，不熟悉 review 、测试和 git 流程**
        * 遇到问题就直接问 mentor，根据 mentor 的反馈修改代码，查找并使用自己不清晰的 git 命令，最终成功 merge
* **2025.3.14：发布接口，看业务需求文档，对接**
    * 将周一周二写的新接口发布到预发布环境
    * 查看业务更新的需求文档，对接前端需求
* **2025.3.17：发布接口，看需求文档，构思思路**
    * 将上周写的新接口发布到生产环境
        * 发现报错，重新发布后解决
        * mentor 说是他没有讲清楚发生产的具体步骤，准备明天跟我说一下
    * 查看业务更新的需求文档
    * 听 mentor 的构思一下如果是我的话我会怎么写
    * 准备明天跟 mentor 聊之后开始具体开发公司的一个即时通讯的项目
* **2025.3.18：跟 mentor 聊 IM 该如何写**
    * 确认 IM 的实现方式
    * 看新框架 GatewayWorker 的文档
    * 熟悉框架和仓库代码
* **2025.3.21：看 GatewayWorker 技术文档**
    * 看技术文档，熟悉 IM 要用的技术框架
    * 看 IM 目前的仓库代码，熟悉当前结构
* **2025.3.24-3.25，3.28：迁移六个用户端 IM 模块和对应接口**
    * 梳理并编写 IM 路由逻辑，统一 IM 目前常量、函数与模型命名
    * 将用户端 IM 的接口迁移到新的 IM 仓库，迁移接口相关依赖与模型
        * 迁移了的接口：
        * 创建群聊、添加群成员、举报群组成员
        * 修改群名、修改群头像、申请加入群、自己退群
    * 完善 IM 仓库目前架构，阅读并熟悉目前已迁移接口的业务逻辑
    * 编写 IM 项目的接口文档，测试已迁移接口
    * 将迁移的接口、模型、依赖提交了两次大的 review
    * 通过后推送到远端仓库，解决合并时遇到的代码矛盾
    * **难点：**
        **1. 原用户端仓库中的 IM 模块依赖的模型、函数和包模块极其复杂，难以梳理清楚具体逻辑**
        * 跟 mentor 及时交流，确定“一个接口一个接口来”的迁移计划以及分工后，细心查看每个依赖，逐步完成迁移

        **2. 缺乏处理合并时遇到代码矛盾的经验，本地仓库进度与远程仓库进度不同，不知道该如何合并**
        * 先自己通过 ai、技术文档和博客搜索并浏览了一下合并代码的常见做法和问题，然后询问 mentor 并确定具体做法，成功解决矛盾并推送到远程仓库
* **2025.3.31-4.1，4.7：写数据库字段批量修改脚本**
    * 通过 php 脚本批量修改数据库中图片资产的 url
    * 继续看项目用到 php 相关框架的技术文档
* **2025.4.8, 4.11, 4.14：写两个新接口，修改一个接口**
    * 为后台管理站项目的小说签约审核模块新增邀请人名字和邀请人 id 字段
    * 为后台管理站项目的小说签约审核模块新增一个导出接口，可将模块内信息按照不同字段导出为 excel 表格
    * 为用户项目的小说签约模块新增保存填写历史记录的接口，并新建数据库表记录用户填写记录，让作者在提交签约申请时若被拒绝后再次填写无需完全从零开始
    * 写、修改接口文档，在本地测试并与前端同时确认传入和返回字段以及数据结构
    * 发布测试环境，测试未发现问题后发布到了预发布环境
    * **难点：**
        **1. 对 php 相关的导出为 excel 表格包工具不熟悉，以前在其他语言项目也未写过导出相关需求，没有编写经验**
        * 查找资料，通过 ai 和相关技术文档查找到相关工具，借鉴项目仓库中其他导出功能的编写范例，从而完成创建导出类 - 创建路由 - 创建 controller 层和 service 层，成功编写了这个接口并实现一调用即下载 excel 表格的需求

        **2. 两个新接口写好后在本地开发环境下测试没有问题，但在发到测试环境后遇到了多个钉钉告警，debug 难以找到问题所在**
        * 询问了 mentor 错误类型，发现是数据库表没有在不同环境下都创建，以及遇到了 Laravel 的 Eloquent ORM 默认不允许批量赋值以防止安全问题，在查找资料问 ai 后成功解决

        **3. 由于对不同项目的 git 分支混淆，导致将测试环境和预发布环境的代码 merge 混乱，本地的 master 分支也落后于已经写好的测试环境**
        * mentor 说用 `git cherry-pick <commit-hash>` 这个命令将特定的 commit 摘出来，我在将本地 master 分支同步然后更新特定的 commit 之后重新创建了一个本地开发分支，重新切到 test 测试环境分支和 pre 预发布环境分支然后重新合并开发分支，成功解决
* **2025.4.15：将新增的接口上线到生产环境**
    * 将后台管理和用户两个项目的新增接口上线到生产环境
    * 继续看技术文档
* **2025.4.18，4.21-4.22，4.25：修改多个接口，写脚本，修改资源 url**
    * 为 `Novel` `cpNovel` `adNovel` 的 `list` 接口添加字段，增加筛选功能
    * `cpNovel` 的导出接口新增一列字段
    * 写了一个迁移数据库中资源 url 的脚本，成功在本地、测试和预发/生产数据库上跑通，将弃用的亚马逊 url 改成腾讯云 url，并修改了多个代码仓中的资源 url
    * 写了一个根据字段删除数据的脚本，成功删除了本地和测试数据库中的数据
    * **难点：**
        **1. 第一次上预发环境服务器，对 php 基本的脚本操作和服务器文件结构不太熟悉**
        * 问 mentor 并查资料，成功跑通
* **2025.4.28-4.29，5.6：开会、梳理仓库结构、写技术文档，修改三个模块共九个老接口**
    * 开了研发内部会议，讨论了现有技术选型的合理性以及后端代码仓的复杂度，被分配梳理各个代码仓并写仓库技术文档的任务
    * 开始重新完整梳理各个代码仓的具体结构，写技术文档
    * 对主业务仓的不同类型的小说模块的资源展示接口进行修改，主要操作为添加/删除字段、增加校验逻辑和添加缓存，为其中三到四个接口增加筛选功能
* **2025.5.9，5.12-5.13，5.16：设计、联调并部署两个模块共十个新接口，继续写技术文档**
    * 根据后台管理的新需求设计新接口，主要是对现有资源（书籍）进行查表、筛选、排序，也有插入、删除等功能接口
    * 写完一版之后跟前端同事联调，确认传入和返回字段、错误信息、排序规则和缓存策略等
    * **难点：**
        **1. 一开始设计的接口数量并不全，或功能有些问题，不符合前端那边的预期**
        * 跟前端同事多次确认、测试、补充、联调，最终提前开发日程三天成功写完所有需求，成功发布到测试服并测试无误

        **2. 加缓存时本应只加读和删的，但是错误添加了写，导致脏缓存，接口无法正常返回数据**
        * 跟 mentor 确认后定位到是我写的写缓存逻辑导致缓存污染，重新了解要求后更改逻辑，只保留了删缓存和读缓存，成功解决问题，接口返回数据正常
* 2025.5.19-5.20，5.23，5.26-27，5.30：**开需求会，设计、联调并部署共二十个新接口**
    * 继续根据后台管理的新需求设计新接口，主要是对书评、群组、帖子、Banner 和书单这几个不同资源进行推荐接口的编写
    * 本地开发环境和测试环境各建了五张表，接口涉及查表、插入、排序和校验等逻辑
    * 按照规范编写接口文档，跟前端同事联调、确认
    * **难点：**
        **1. 设计新接口时需求有一些细节没有在需求会上提到，不确定具体功能是什么、该如何实现** 
        * 跟产品同事确认需求，跟 mentor 协定实现方案，最终成功实现

        **2. 建表时由于不同表涉及到的业务逻辑不同，对应的字段、是否分表、分表逻辑等也不同，不确定该如何修改**
        * 先按照现有的其他表的表结构建好表，再让 mentor 帮我看有哪些细节、命名规范和分表逻辑是需要修改的，再针对性修改，最终成功根据表编写接口

        **3. 写多个模块的创建推荐新接口时因为对不同资源编码、解码的工具函数不够熟悉，编码后的资源 ID 无法正确解码**
        * 仔细看了不同资源的编解码函数具体实现后对不同模块的创建推荐接口做针对性地修改
        * 找 mentor 确认当前后台项目中编解码函数的版本是否最新，将其他项目中最新的资源编解码函数迁移到当前仓库中，最终成功发布新接口

## 项目架构
公司采用的是比较严格的企业级架构划分，从代码规范到环境管理都比较清晰

* 环境
    * 本地开发环境
    * 测试环境
    * 预发布环境
    * 生产环境

开发环境和测试环境的数据基本一致，预发布与生产环境数据也基本一致，但二者会有些许不同

从环境出发，公司的每个项目都有这几个环境各自的分支，代码从编写到上线也会把这四个环境依次跑一遍，前面三个都不出错才会上生产

* 项目
    * 用户端
    * 运营后台
    * 管理站
    * IM

目前我只接触到了这几个项目，还有个别仓库是类似于工具组件的，等我用到了再说

公司做的是海外网文平台，运营后台是给内容部的同事用的，管理站和 IM 目前我还不是特别清楚各自的用途，用到了会再补充

以用户端为例，下面是公司这个仓库的基本架构

* MVC + service
    * Model 层 ------ 数据模型
    * Service 层 ---- 业务逻辑
    * DAO 层 -------- 数据访问
    * Controller 层 - 处理请求响应

由于这种多封装了一层 service 层的模式，导致代码的可读性相对差一些，需要很强的熟悉度才能读起来比较舒服

仓库也有很多其他的工具组件和其他文件夹，也是等我用到了再记录吧

## 代码流程
* 先写接口文档，设计数据结构，每个接口的路由是什么，然后再写代码，**开始写之前一定要确保切到了 `master` 分支**
* 写好代码之后，先用 Apifox 在本地开发环境自己测试一遍，不报错没问题再继续
* 运行 `git add .` 将所有修改的文件添加跟踪，运行 `git commit -m "your_description"` 提交到本地仓库
* 然后用 `arc diff` 把代码提交到 Phabricator 给 mentor 评审 review
* review 通过之后关闭 review 申请，创建一个新分支 `git switch -c dev/new branch name`，并推送到远端，记得加 `dev/` 前缀
* 推送到远端：`git push --set-upstream origin dev/new branch name`
* 推送完之后用 `git checkout test` 切换到测试分支，运行 `git pull` 更新
* 然后运行 `git merge new-branch-name` 来合并分支，再推送到远程 `git push`
* 推完之后登录 `https://pubsys.mespery.com/`，新建申请后选择对应的发布环境和应用，再点击发布就行
* 发测试、预发布和生产环境的流程都是差不多的，先切到对应的分支，更新，merge，然后推送

## 进入测试服和预发
* 进测试：`sudo su - developer`
* 进主目录：`cd /app`
* 进预发：`ssh web01`

注：CLI 中按 `Tab` 键可以自动补全命令