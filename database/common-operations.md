### MySQL
#### 添加环境变量
将 MySQL 的安装地址(/bin)添加到系统的环境变量 `path` 中后，即可在任意终端运行 MySQL 命令
1. 打开系统设置，搜索并进入环境变量设置
2. 找到系统变量，进入后找到 Path ，点击**编辑**
3. 添加MySQL的安装路径，保存设置并重新打开命令提示符即可

#### 一些 MySQL 命令
* 查看创建的数据库：`show databases;`
* 创建数据库：`create database yourdatabase;`
* 进入创建的数据库：`use yourdatabase;`
* 显示当前数据库中的所有表：`show tables;`
* 查看某个表的结构：`describe table_name`
* 插入数据：`insert into table_name (username, password) values ('admin', '123');`，其中第一个括号里的是列名，第二个括号里的是值
* 查询插入的数据：`select * from table_name;`
* 删除表中某一行数据：`DELETE FROM user WHERE username = 'name';`
* 清空整个表的所有数据：`DELETE FROM user;`
* 删除整个表而不是数据：`DROP TABLE user;`
* 完全清空表结构和数据：`TRUNCATE TABLE user`
* 查看当前 MySQL 服务被多少个客户端连接：`show processlist`
* 退出MySQL：`EXIT;`

创建一个用户表：

    CREATE TABLE user (
        username CHAR(50) NOT NULL,
        passwd CHAR(50) NOT NULL
    ) ENGINE=InnoDB;


    CREATE TABLE table_name (
    id INT PRIMARY KEY,
    name VARCHAR(255)
    );
