## 权限问题
MySQL 在登录时会根据用户的不同而有不同的权限限制，比如 root 用户可能被限制只能通过 sudo 方式登录

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