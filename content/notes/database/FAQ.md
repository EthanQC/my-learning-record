---
title: FAQ
date: '2025-09-03'
tags:
  - database
summary: MySQL 在登录时会根据用户的不同而有不同的权限限制，比如 root 用户可能被限制**只能通过 sudo 方式登录**
---
## 权限问题

MySQL 在登录时会根据用户的不同而有不同的权限限制，比如 root 用户可能被限制**只能通过 sudo 方式登录**

如何修改：

1. 先使用 `sudo mysql -u root -p` 登录
2. 切到 mysql 数据库，查看 root 用户权限和认证方式

        -- 切换到 mysql 数据库
        use mysql;

        -- 查看 root 用户的权限和认证方式
        select user, host, plugin, authentication_string from user where user = 'root';

        -- 如果 plugin 是 caching_sha2_password，需要更改为 mysql_native_password
        ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'wkr1835484520';

        -- 刷新权限
        FLUSH PRIVILEGES;

3. 为用户提供某个数据库的访问权限

        GRANT ALL PRIVILEGES ON xxdb.* TO 'root'@'localhost';
        FLUSH PRIVILEGES;

这样，就可以直接在命令行中通过 `mysql -u root -p` 来登录 MySQL 了

同时在通过编程语言客户端为一些常用工具（比如 Elasticsearch、Redis 等）写脚本时也不会再遇到类似于 `Access denied for user 'root'@'localhost'
exit status 1` 这样的权限错误而导致无法正常连接了

## 如何在已经无法登录 MySQL 的情况下修改其最大连接数？

一般来说，MySQL 的配置文件都在 `etc/mysql` 这个路径下，我们可以先用下面两个指令搜索一下：

`sudo find / -name my.cnf 2>/dev/null`
`sudo find / -name mysqld.cnf 2>/dev/null`

这两个命令会从根目录开始，查找名为 `my.cnf` 或 `mysqld.cnf` 的文件，`2>/dev/null` 的作用是把**无权限访问目录**的报错过滤掉，方便你查看结果

然后最简单但也是最蠢的方法就是一个一个用 vim 进文件找配置，正常情况下配置文件都是 `/etc/mysql/conf.d/mysqld.cnf`，我们只需要用 vim 在 `[mysqld]` 字段下添加 `max_connections = 500`，就可以修改最大连接数了，你可以改成任意你想要的数字

但要注意配置**不要**写到 `[mysql]` 字段或其他字段下
