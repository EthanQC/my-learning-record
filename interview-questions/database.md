## 问题列表
#### 数据库相关
* 一条 SQL 查询语句是如何执行的？
* 数据库的事务隔离级别有哪些？
* 事务的四大特性有哪些？MySQL 的执行引擎有哪些？
* MySQL为什么使用B+树来作索引？
* 说一下索引失效的场景？
* undo log、redo log、binlog 分别有什么用？
* 你在查询的时候调用的另一个服务宕机了怎么办？
* 数据库的慢查询要怎么优化？
* 分库分表了解吗？项目中有没有实际用到？
* 讲一下事务，以及哪个隔离级别解决了脏读和幻读
* 建立索引要注意哪些问题
* 性别和年龄要不要建立索引，以及记录的如果是初中生的年龄，还要不要建立索引
* 是不是有索引就一定会走，优化器选择走索引的边界值是多少
* 讲一下常见的存储引擎
* 同样是一百万的数据量，读的话，InnoDB 和 MyISAM 哪个更快
* 给你一个用户信息表，选择使用哪个存储引擎来存储，为什么
* 按照种类讲一下 MySQL 的索引
* MySQL 建表会使用到哪些索引
* 多级评论的表（最多二级），你会设计哪几个关键字段
* 写 sql，查询二级评论最多的一级评论，取前十条
* MySQL 和 redis 的缓存一致性该如何保证
* 联合索引在匹配的时候要考虑什么
* 数据量变成原来的十倍，该怎么办

#### redis 相关
* 说一下热点 key 和大 key
* 为什么学 redis？是否了解其他分布式缓存技术？
* 讲一下 redis 的缓存雪崩，击穿和穿透
* redis 的 QPS，单机顶不住，该怎么办
* 经常用 redis 的哪几种类型
* 有过使用分布式锁的经验吗，分布式锁底层用的是哪两个命令
* redis 集群是什么，你的 redis 是什么集群，主 redis 宕机了库存还能做吗

## MySQL 相关

**Q：一条 SQL 查询语句是如何执行的？**

A：

**Q：数据库的事务隔离级别有哪些？**

A：

**Q：事务的四大特性有哪些？MySQL 的执行引擎有哪些？**

A：

**Q：MySQL为什么使用B+树来作索引？**

A：

**Q：说一下索引失效的场景？**

A：

**Q：undo log、redo log、binlog 分别有什么用？**

A：

**Q：你在查询的时候调用的另一个服务宕机了怎么办？**

A：嗯首先在调用失败之前应该就会有一些防御机制，比如超时控制和熔断降级等，同时也可以做有限次数的重试，对于一些可缓存的数据可以从比如说 redis 读取旧数据，当真的出现失败时应该会马上有实时监控的告警，比如钉钉，然后就可以先去看一下日志和告警信息来定位问题，再针对性地解决问题

**Q：数据库的慢查询要怎么优化？**

A：先查一下日志看看是哪些语句是慢查询，然后可以用 EXPLAIN 来分析一下执行计划，看看是否有索引没有命中、全表扫描还是排序开销大等问题，如果是索引没有命中就可以考虑加索引，如果是全表扫描就可以考虑优化 SQL 语句，或者是加一些缓存来减少数据库的压力；另外还可以考虑分库分表来提高性能；索引优化的话可以考虑使用覆盖索引来减少回表的次数，或者是用联合索引来减少索引的数量，也可以删除重复和无用的索引来让优化器更快选出最优索引；如果是排序开销大就可以考虑加一个临时表来存储中间结果，或者是用一些缓存来减少数据库的压力；另外也可以分多几个库，比如主库负责写入，从库负责读取，也可以分区分表来提高性能，或者重新设计表结构，非实时场景可以先写入消息队列然后再异步处理

**Q：分库分表了解吗？项目中有没有实际用到？**

A：有了解，分表就是把一张比较大的表按照某种规则拆分成多张同结构的小表，用来解决单表数据量过大导致的性能问题，比如说可以按时间、ID 或者是地理位置来分表；分库就是把一个数据库拆分成多个数据库，通常是把主库和从库分开，主库负责写入，从库负责读取，这样可以提高性能和可用性；在项目中我还没有实际用到分库分表，因为目前的项目数据量还不大，但我有考虑过在设计时就把这个架构考虑进去，以便后续扩展，比如说可以把用户表和游戏数据表分开，用户表可以按 ID 来分表，游戏数据表可以按时间来分表，这样就能更好地支持高并发和高可用性了；另外在设计时也要考虑到数据的一致性和完整性，比如说在分库分表后要保证跨库事务的一致性，可以使用两阶段提交或者是补偿事务等方式来实现

**Q：如果现在有一个有十亿数据量的大表需要分表，该怎么做，分表之后怎么切业务**

A：嗯首先要选一个既能均匀打散数据又能经常用来查询或关联的字段，比如 user_id 这种的做哈希分配，或者按时间做范围分区，设计好分表规则后就可以创建新的分表，然后把旧表的数据迁移到新表中，迁移时可以先把旧表的数据按规则分批次地插入到新表中，然后再把旧表的数据删除，最后再把旧表删除；在切换业务时可以先把新表的读写权限开放给部分用户进行灰度测试，测试通过后再全面切换到新表；在切换过程中要注意数据的一致性和完整性，比如说在切换前要先备份数据，在切换后要监控数据的一致性和完整性，确保没有数据丢失或错误

**Q：讲一下事务，以及哪个隔离级别解决了脏读和幻读**

A：事务是指一组作为单一逻辑单元执行的数据库操作，要么全部成功提交，要么全部失败回滚，其包含 ACID 四大特性，也就是原子性、一致性、隔离性和持久性，原子性是指事务中的操作要么都执行，要么都不执行，一致性是指事务执行前后数据库的状态是一致的，隔离性是指并发执行的事务之间互不干扰，一个事务不应该看到另一个未提交事务的中间状态，持久性是指事务一旦提交，对数据的修改就是永久性的，即使数据库崩溃也不会丢失；常见的并发事务间出现的问题主要有脏读、不可重复读和幻读，脏读是指一个事务在修改了数据之后还未提交事务时，另一个事务却读取到了该事务修改后的数据，如果该事务触发回滚，那么这个数据就是过期的，不可重复读是指一个事务读取了两次同一个字段的数据，但另一个事务却在该事务读取两次数据的中间修改了一次这个字段的数据并且在该事务提交之前就提交了，这就导致这个事务发现前后两次读到的数据不一样，幻读是指当一个事务多次查询某个条件的记录时，另一个事务对符合条件的记录数量做了修改，比如插入或者删除了一条记录，并在这个事务提交前提交了，导致该事务多次的查询结果记录数量不一致，可能增加了也可能减少了，就像出现了幻觉一样；为了解决脏读、不可重复读和幻读的问题，事务有不同的隔离级别，分别是读未提交、读已提交、可重复读和串行化，读未提交是最低的隔离级别，相当于什么都没做，读已提交很好地解决了脏读的问题，它强调当一个事务提交之后，这个事务做的变更才能被其他事务看到，它在每条语句执行前都会重新生成一个 read view，也就是一个数据快照，而可重复读则是在启动事务时生成数据快照，然后整个事务期间都用这一个 read view，所以可重复读可以很好地避免不可重复读的问题，而幻读只有使用最高的隔离级别串行化才能彻底解决，串行化是在内部对查询范围和索引都加了锁，保证任何并发插入和删除都要排队；在 MySQL 中 InnoDB 引擎默认的隔离级别是可重复读，但它对幻读也做了优化，可以避免大多数幻读，它主要是用记录锁和间隙锁实现的，来阻塞某个范围内其他的插入语句

**Q：建立索引要注意哪些问题**

A：首先是要明确好热点查询，只针对真正会用到且查询频率高的字段建立索引，避免过多的索引导致性能下降；其次是要考虑索引的选择性，选择性越高的字段越适合做索引，选择性低的字段做索引反而会降低性能；另外是要考虑索引的存储空间和维护成本，索引会占用额外的存储空间，并且在数据更新时也需要维护索引，所以要权衡好性能和存储空间之间的关系；最后是要定期检查和优化索引，删除不必要的索引，避免冗余和重复的索引

**Q：性别和年龄要不要建立索引，以及记录的如果是初中生的年龄，还要不要建立索引**

A：其实都没什么必要，因为性别和年龄的选择性都比较低，性别只有男和女两个值，年龄也只有特定数量的值，所以做索引的话反而会增加存储空间和维护成本，而且查询性能提升也不明显；如果是初中生的年龄，那就更没必要了，因为初中生的年龄范围也就 12 到 15 岁，只有四个值，做索引的话反而会降低性能，因为索引页命中后还要回表，除非是业务确实有这个需求，那可以把年龄放到联合索引的末尾，但其实这样也不会提升特别多性能，不如用缓存或者分区表来优化

**Q：是不是有索引就一定会走，优化器选择走索引的边界值是多少**

A：不是的，是否走索引是由优化器的代价比较决定的，优化器会估算全表扫描的顺序读成本和索引查找 + 回表的随机读成本，然后选择代价更低的方案；边界值的话其实并不是固定的，常用的经验法则是当索引筛出的行数小于总行数的 3% - 5% 时索引扫描通常更优，否则全表扫描更划算，但这也不是绝对的，因为有很多参数都影响着优化器的选择，在实际开发中可以使用 explain 和 analyze 来观察优化器行为来判断是否使用了索引

**Q：讲一下常见的存储引擎**

A：常见的存储引擎有 MyISAM、InnoDB 和 Memory 等，MyISAM 是 MySQL 早期版本的默认存储引擎，支持表级锁和全文索引，但不支持事务和外键约束，适合读多写少的场景；InnoDB 是 MySQL 的事务型存储引擎，也是现代 MySQL 版本的默认存储引擎，支持行级锁、事务和外键约束，适合高并发和复杂查询的场景；Memory 存储引擎是将数据存储在内存中，速度非常快，但数据不持久化，适合临时表和缓存等场景；另外还有一些其他的存储引擎，比如 CSV、ARCHIVE 和 FEDERATED 等，分别用于 CSV 文件存储、归档数据和分布式数据库等场景

**Q：同样是一百万的数据量，读的话，InnoDB 和 MyISAM 哪个更快**

A：如果只是纯粹的单次读的话，MyISAM 会稍微快一点，因为它没有事务和 MVCC 的元数据开销，但如果是高并发的读写混合场景下，InnoDB 的 Buffer Pool 同时缓存数据和索引，在预热后会更快，因为它支持行级锁和多版本并发控制（MVCC），可以更好地处理并发事务，避免了 MyISAM 的表级锁带来的性能瓶颈；另外 InnoDB 还支持更复杂的查询和事务处理，所以在大多数情况下，InnoDB 是更好的选择

**Q：给你一个用户信息表，选择使用哪个存储引擎来存储，为什么**

A：嗯用户信息表是属于读多写少的场景，所以我会优先选择默认的 InnoDB 引擎，它既能提供完整的事务和 MVCC，保证用户数据在并发修改时能原子且一致地提交，又支持外键约束和崩溃自动恢复，符合核心业务对数据可靠性的要求，只有在完全只读或者对高可用有特殊要求的极端场景下我才会考虑 MyISAM 或者其他引擎

**Q：按照种类讲一下 MySQL 的索引**

A：按数据结构有 B+ 树索引、哈希索引和全文索引，按物理存储有聚簇索引和二级索引，按字段特性有主键索引、唯一索引、普通索引、前缀索引、单列索引和联合索引，B+ 树索引是最常用的索引类型，支持范围查询和模糊查询，哈希索引适合等值查询但不支持范围查询，全文索引适合对大文本字段的全文检索；聚簇索引是数据存储的顺序和索引的顺序一致，二级索引则是数据存储和索引存储分离；主键索引是唯一且非空的索引，唯一索引是唯一但可以为空的索引，普通索引是非唯一的索引，前缀索引是只对前 N 个字符建立索引，单列索引是对单个字段建立的索引，联合索引是对多个字段联合建立的索引

**Q：MySQL 建表会使用到哪些索引**

A：在建表时我会先给表定义一个自增主键做聚簇索引，保证行存和主键一致，如果业务需要保证某列数据唯一，就加唯一索引，对于常用的过滤和连接字段，我会建普通索引来防止全表扫描，如果多个字段经常一起作为条件，我会用最左前缀建立联合索引，并尽量做覆盖索引来减少回表；如果有大文本字段需要做全文检索，我会使用全文索引来加速查询

**Q：多级评论的表（最多二级），你会设计哪几个关键字段**

A：我会让表里有 comment_id (主键)、post_id (归属资源)、user_id (评论人)、parent_id (父评论，NULL 表示一级)、root_id (根评论，用于快速聚合一级＋二级)、reply_to_user_id (被@用户)、level (层级)、content (内容) 以及 created_at、updated_at 打点时间。
这样，当我要查询一个帖子下所有一级评论，就 WHERE post_id=? AND level=1；要加载某条一级评论的二级回复，就 WHERE root_id=? AND level=2。reply_to_user_id 让前端能正确显示“回复 @某人”。索引方面，我会针对 (post_id, level, created_at) 做分页，以及 (parent_id, root_id) 做回复聚合，保证高并发场景下也能快速返数据

**Q：写 sql，查询二级评论最多的一级评论，取前十条**

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

**Q：MySQL 和 redis 的缓存一致性该如何保证**

A：先更新 MySQL，写库之后再删除 redis 缓存，确保后续请求要么打到旧缓存要么打到库，避免出现反向失效，短延时后可以再删除一次缓存，防止并发写入时读到旧值，如果业务对一致性要求较高，可以在更新和删缓存之间加一下分布式锁，保证同一条记录在任何时刻只有一个线程在操作缓存；在写库时将缓存失效消息发送到消息队列，消费者异步订阅消息并在各节点删除或更新缓存，但要保证消息队列的消息不丢失，也可以通过监听 MySQL 的 binlog 来实时把数据变更同步到 redis

**Q：联合索引在匹配的时候要考虑什么**

A：首先要遵循最左前缀原则，查询必须从最左边的字段开始才能使用索引，并且只有等值条件才能继续往后匹配，遇到范围查询则会截止，另外要把选择性高的列放在最前面，避免在索引列上使用函数或隐式转换，否则都会导致不能走索引，如果要进一步提高性能，可以设计成覆盖索引，让查询完全在索引层面完成而不用回表

**Q：数据量变成原来的十倍，该怎么办**

A：主要有三个层面可以操作，一个是存储层，可以做分库分表和 MySQL 分区，把单表行数从千万级降到百万级以下，并重新评估索引，把高选择性字段建成联合或覆盖索引，也可以考虑只把热数据留在主库；缓存与异步层面的话可以考虑加深本地和 redis 的二级缓存，对于写入量大的统计、日志和推荐等可以用消息队列异步入库，减少对主库的直接冲击；最后应用与运维层面可以考虑读写分离，让从库承担更多读流量，关键服务拆分成独立的微服务做水平扩缩容，可以再结合告警和 k8s 或重新跑压测等

## Redis 相关

### 项目相关
**Q：你在项目中使用 Redis 做了什么缓存？能举例说明使用 Redis 带来的性能提升幅度吗？是否做过基准测试或压测？**

A：

**Q：说一下热点 key 和大 key**

A：热点 key 主要是在高并发场景下被频繁读写的同一个 redis key，短时间内 QPS 极高，单点压力过高导致 redis 性能下降，甚至会击穿后端，大 key 则是指 redis 中存储的单个 key 占用内存过大，可能会阻塞 redis 主线程或导致内存溢出、慢查询等问题，解决方法的话可以将单个热点 key 拆成多个子 key，然后对同一 key 并发请求做请求合并，只发一次真实请求，其他请求等待结果复用，也可以把主从节点做读写分离；大 key 的话可以拆分成小 key，然后渐进式迭代访问，分批读取，使用哈希结构这样每次广播可以只做差量更新

**Q：为什么学 redis？是否了解其他分布式缓存技术？**

A：嗯因为 redis 本身是一个性能非常高的内存数据库，有丰富的数据结构，功能也非常强大，既能做缓存也能做消息队列、分布式锁等，使用起来也很方便，正好在项目中也有这方面功能实现的需求，所以我就选择了 redis，目前只是简单学了一下它的使用，底层我还在学习中，现在主要是用它来做项目里的房间状态缓存和游戏事件的快速推送；另外我也了解过其他的分布式缓存技术，比如说 Memcached，它是一个高性能的分布式内存对象缓存系统，主要用于加速动态 Web 应用程序，通过减轻数据库负担来提高性能 ，但它不支持数据持久化和复杂的数据结构，只适合简单的请求缓存

**Q：讲一下 redis 的缓存雪崩，击穿和穿透以及解决方法**

A：缓存穿透是指用户频繁请求不存在的数据，每次都无法在缓存中命中，又直接打到了数据库，这个主要是要对请求参数做合法校验，比如用布隆过滤器，或者直接存一个空值并设置较短的 TTL，这样就可以缓解数据库压力；缓存击穿主要是指某个热点 key 恰好在高并发时刻过期，导致大量并发请求无法命中缓存，同时击穿到数据库做查询或写入，瞬间击垮后端，这个主要要设置热点 key 的过期时间为随机值，也可以使用互斥锁来加锁，只有一个请求能去查询数据库，其他请求等待结果，或后续并发复用同一个结果；缓存雪崩就是指大量缓存，比如整个 redis 实例或大批 key 在同一时间点集中到期，或 redis 整体不可用，导致所有请求都到数据库，形成雪崩式的流量冲击，这个主要是要设置不同的过期时间，避免同一时间点集中到期，同时也可以使用多级缓存，比如在业务进程内做一层 LRU，让热点数据优先走本地，或采用 redis 集群和限流降级

**Q：redis 的 QPS，单机顶不住，该怎么办**

A：当我发现单机 redis 达到 QPS 瓶颈后，首先会在实例内排查慢命令，避免全表扫描并使用批量写入、单条原子增量命令代替多条写入，同时在应用层加进程级本地缓存来减少对 redis 的打击，如果单机硬件已升级到极限，就要使用主从复制和读写分离，把写请求集中到主节点，读请求分给多个从节点，然后做自动路由，随着业务继续扩张的话就要考虑部署 redis cluster，把数据分片到多个主节点，每个再配从节点做高可用，Cluster 模式下节点宕机能自动故障切换，扩缩容也更灵活

**Q：经常用 redis 的哪几种类型**

A：我最常用的是 String、哈希、List、Set、Sorted Set 和 Pub/Sub，String 是用来做验证码、分布式锁、计数器，哈希是用来存储用户会话、房间状态等对象，List 是用来做消息队列、任务队列，Set 和 Sorted Set 是用来做排行榜、标签等，Pub/Sub 是用来做实时消息推送和事件通知等，另外根据不同场景我也会用 Stream 做可靠消息流，HyperLogLog 做大数据量的去重，Geo 做地理位置相关的查询等

**Q：有过使用分布式锁的经验吗，分布式锁底层用的是哪两个命令**

A：我在项目里主要是用 redis 做分布式锁，底层主要是用 SETNX 抢锁，然后再用 EXPIRE 给锁设置 TTL，释放时会先用一段 Lua 脚本来校验锁的持有者标识，只有匹配才会执行 DEL，避免误删锁

**Q：redis 集群是什么，你的 redis 是什么集群，主 redis 宕机了库存还能做吗**

A：redis 集群是一种分布式部署方案，通过主从、分片和故障自动转移来实现高可用，在我的项目中我用的是 redis cluster 模式，一共三主三从，16384 个哈希槽自动分片，如果主节点宕机，集群会自动触发 failover 把从节点提升为主节点来继续处理请求，不影响业务，如果用 redis 做库存，那在设计上会配合主从复制、幂等扣减、数据库兜底等机制，确保即使 redis 出故障也不会出现库存丢失或订单错误