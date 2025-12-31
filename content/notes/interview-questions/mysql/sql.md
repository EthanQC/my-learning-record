## 常用命令
#### 数据查询



#### 多表操作（连接与子查询）



## 手撕
#### 如果现在有一张要记录多级评论的表，你会设计哪几个关键字段？

* **标识和关联类字段**
  * `id`
    * 评论主键 ID
    * BIGINT，AUTO_INCREMENT
    * 唯一标识一条评论
  * `target_type`
    * **被评论的**对象类型，如文章、视频、动态、消息等
    * TYINYINT 或 ENUM
  * `target_id`
    * 被评论对象的 ID
    * BIGINT
* **支撑多级的关键结构字段：父子关系 + 根节点 + 层级**
  * `parent_id`
    * 父评论 ID，顶级评论为 0 或 NULL
    * BIGINT
    * 表示当前评论的直接上级是谁，即**我直接回复的是谁**
    * 可以用来快速查询某条评论下的直接子评论：`where parent_id = ?`
    * 前端也可以用来展示被回复的对象
  * `root_id`
    * 根评论 ID，是**整棵树的入口**
    * BIGINT
    * 对于顶级评论： root_id = id 自己
    * 对于任意子评论：root_id = 顶级评论的 id
    * 可以一次性查出某个主楼下所有的楼中楼：`where root_id = :top_comment_id order by created_at asc`
  * `level`
    * 评论的**层级**，顶级评论为 1，一级回复为 2，二级回复为 3，以此类推
    * TINYINT
    * 可以用于限制评论的最大层级，避免无限递归
* **用户和内容相关字段**
  * `user_id`
    * 评论用户 ID
    * BIGINT
    * 指向用户表的**外键**
  * `reply_to_user_id`
    * 被回复的用户 ID
    * BIGINT
    * 当 A 回复 B 的评论时，reply_to_user_id = B 的 user_id
    * 可以用来在评论中显示 `回复 @用户名`
  * `content`
    * 评论内容
    * TEXT 或 VARCHAR(500)
    * 如果有富文本/图片，可以再配一个 extra JSON 字段存储额外信息
  * `created_at` / `updated_at`
    * 评论创建和更新时间
    * DATETIME 或 TIMESTAMP
    * 用于排序和展示评论时间
* **状态和统计字段**
  * `status`
    * 评论状态，如正常：0、删除：1、审核中：2等
    * TINYINT
  * `is_pinned`
    * 是否置顶评论
    * BOOLEAN
  * `is_deleted`
    * 软删除标志
    * TINYINT(1)
    * 真删除会破坏楼中楼结构，一般先逻辑删，再看情况做物理清理
  * `like_count`
    * 点赞数
    * INT
    * 真正的点赞明细可以放在单独的评论点赞表，这里做缓存计数
    * 可以定期异步更新，避免频繁写评论表
  * `reply_count`
    * 回复数
    * INT
    * 统计某条评论下的直接子评论数

target_type + target_id 是**评论所属对象**，让我们知道这条评论是挂在哪个资源上的，还可以做**索引**：`index idx_target (target_type, target_id, root_id, created_at)`，用来查比如**某篇文章下的所有评论树**

like_count 和 reply_count 是常用的冗余统计字段，在点赞或回复成功后可以**先写一条明细记录**，同时对应的评论记录做**增量更新**，避免每次都去 count 点赞表或评论表，提升查询性能

完整 SQL：

```sql
CREATE TABLE `comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论主键 ID',
  
  `target_type` TINYINT NOT NULL COMMENT '被评论对象类型：1=文章，2=视频，3=动态，4=消息等',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT '被评论对象 ID',

  `parent_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '父评论 ID，顶级评论为 NULL',
  `root_id`  BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '根评论 ID，顶级评论为自身 ID',
  `level`    TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '评论层级：1=顶级，2=回复，3=子回复……',

  `user_id`          BIGINT UNSIGNED NOT NULL COMMENT '评论用户 ID，指向用户表',
  `reply_to_user_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '被回复的用户 ID',

  `content` TEXT NOT NULL COMMENT '评论内容',
  `extra`   JSON NULL COMMENT '扩展信息（图片、表情、@信息等，可选）',

  `status`     TINYINT NOT NULL DEFAULT 0 COMMENT '评论状态：0=正常，1=删除/屏蔽，2=审核中等',
  `is_pinned`  TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶评论：0=否，1=是',
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否软删除：0=否，1=是',

  `like_count`  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数（冗余字段）',
  `reply_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '回复数（冗余字段）',

  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
               ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),

  -- 拉某个目标下的评论树：按时间排序分页
  KEY `idx_target_root_time` (`target_type`, `target_id`, `root_id`, `created_at`),
  -- 查某条评论下的直接子评论
  KEY `idx_parent_time` (`parent_id`, `created_at`),
  -- 查一整个主楼的所有楼中楼（如果不按 target 维度也要这么查）
  KEY `idx_root_time` (`root_id`, `created_at`),
  -- 查某个用户的历史评论
  KEY `idx_user_time` (`user_id`, `created_at`),
  -- 查“谁回复了我”的列表
  KEY `idx_reply_to_user_time` (`reply_to_user_id`, `created_at`),
  -- 专门针对顶级评论查询
  KEY `idx_target_top_level` (`target_type`, `target_id`, `level`, `created_at`) WHERE `parent_id` IS NULL

  -- 外键约束（如果你线上不想要外键，可以删掉这些约束，只保留字段和索引）
  CONSTRAINT `fk_comments_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_comments_reply_user` 
    FOREIGN KEY (`reply_to_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_comments_parent` 
    FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`),
  CONSTRAINT `fk_comments_root` 
    FOREIGN KEY (`root_id`) REFERENCES `comments` (`id`)
) ENGINE=InnoDB 
  DEFAULT CHARSET = utf8mb4 
  COLLATE = utf8mb4_unicode_ci
  COMMENT='多级评论表';
```

#### 写 sql，查询二级评论最多的一级评论，取前十条



  -- 查询前 10 个二级评论最多的一级评论 ID 及其回复数
  SELECT
  root_id AS comment_id,
  COUNT(*) AS reply_count
  FROM comment
  WHERE level = 2
  GROUP BY root_id
  ORDER BY reply_count DESC
  LIMIT 10;

思路：先把所有二级评论（level=2）按 root_id 聚合，计算每个 root 的回复数，再按数量倒序取前 10