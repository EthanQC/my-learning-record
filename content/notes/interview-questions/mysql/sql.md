## 常用命令
#### 


## 手撕
#### 写 sql，查询二级评论最多的一级评论，取前十条

A：

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