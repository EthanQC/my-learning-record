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
* 查询插入的数据（基本查询）：`select * from table_name;`
* 查询插入的数据（过滤条件）
    * `select name, email from users where name like 'xxx';`
    * `select * from users where name like 'xxx' and email like 'xxx';`
* 更新表中的数据：`update table_name set xxx=xxx where xxx=xxx;`，其中 where 后面的是用来索引的
* 删除表中某一行数据：`delete from table_name where xxx=xxx;`
* 清空整个表的所有数据：`delete from table_name;`
* 删除整个表而不是数据：`drop table table_name;`
* 向现有表中添加新列：`alter table table_name add column xxx type;`
* 修改现有列中内容：`alter table table_name change column xxx xxx type;`，其中第一个xxx是原有列的名字，第二个xxx是修改后列的名字
* 从表中删除列：`alter table table_name drop column xxx;`
* 修改表中现有列的数据类型：`alter table table_name modify column xxx type;`
* 完全清空表结构和数据：`TRUNCATE TABLE table_name;`
* 删除数据库及其所有表：`drop database database_name;`
* 查看当前 MySQL 服务被多少个客户端连接：`show processlist;`
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
