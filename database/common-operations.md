### MySQL
#### 添加环境变量
将MySQL的安装地址(/bin)添加到系统的环境变量`path`中后，即可在任意终端运行MySQL命令
1. 打开系统设置，搜索并进入环境变量设置
2. 找到系统变量，进入后找到Path，点击**编辑**
3. 添加MySQL的安装路径，保存设置并重新打开命令提示符即可
#### 一些MySQL命令
* 确认版本信息：`mysql --version`
* 启动MySQL（Windows中，用管理员权限打开cmd或powershell）：`net start mysql80`
* 查看创建的数据库：`SHOW DATABASES;`
* 创建数据库：`CREATE DATABASE yourdatabase;`
* 进入创建的数据库：`USE yourdatabase;`
* 插入数据：`INSERT INTO user(username, password) VALUES('admin', '123');`
* 查询插入的数据：`SELECT * FROM user;`
* 删除表中某一行数据：`DELETE FROM user WHERE username = 'name';`
* 清空整个表的所有数据：`DELETE FROM user;`
* 删除整个表而不是数据：`DROP TABLE user;`
* 完全清空表结构和数据：`TRUNCATE TABLE user`
* 退出MySQL：`EXIT;`

创建一个用户表：

    CREATE TABLE user (
        username CHAR(50) NOT NULL,
        passwd CHAR(50) NOT NULL
    ) ENGINE=InnoDB;