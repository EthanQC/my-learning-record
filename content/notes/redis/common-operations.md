## 常用命令

以下命令操作环境均为 WSL 上的 Ubuntu

* 安装 Redis：`sudo apt install redis-server`
    * 安装完成后 Redis 会自动启动
* 启动 Redis： `sudo systemctl start redis`
* 关闭 Redis： `sudo systemctl stop redis`
* 查看 Redis 运行状态： `sudo systemctl status redis`
* 进入 Redistribution 命令行工具：`redis-cli`
    * 默认会显示127.0.0.1:6379，本地回环地址，默认端口是6379
* 一些简单的命令：
    * 存储数据：SET name "小明" （把“name”这个钥匙的值设为“小明”）
    * 读取数据：GET name （返回“小明”）
    * 删除数据：DEL name （删除“name”这个钥匙）
    * 检查是否存在：EXISTS name （如果存在返回1，不存在返回0）
    * 数字加1：INCR count （把“count”的值加1，比如从0变成1）