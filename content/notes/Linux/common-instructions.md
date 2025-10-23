## Linux
#### 安装 Ubuntu
* 需要梯子，推荐直接在 Microsoft Store 中搜索 Ubuntu 后下载即可
* 安装后要设置用户名和密码

#### MySQL
* 安装MySQL：`sudo apt install mysql-server`
* 确认版本信息：`mysql --version`
* 安装 MySQL
    * Linux 中：`sudo apt install mysql-server`
* 启动 MySQL
    * Windows 中，用管理员权限打开cmd或powershell：`net start mysql80`
    * Linux 中：`sudo systemctl start mysql` 或 
    `sudo service mysql start`（service 是老版本Ubuntu的命令工具）
* 检查 MySQL 服务状态：
    * Linux 中：`sudo systemctl status mysql`
* 登录MySQL：`sudo mysql -u root -p`
* 停止 MySQL 服务：
    * Linux 中：`sudo systemctl stop mysql`
* 重启 MySQL 服务：
    * Linux 中：`sudo systemctl restart mysql`

#### 文件管理
* 查看当前目录下所含文件：`ls`
* 检查更新：`sudo apt update`
* 更新：`sudo apt upgrade`

#### 环境管理
* 查看python版本：`python3 --version`
* 激活虚拟环境：`source /path/to/your/venv/bin/activate`
* 退出虚拟环境：`deactivate`

#### 在WSL中安装vs code的辅助工具（在Ubuntu终端中）：

    sudo apt update
    sudo apt install code
    sudo apt install code-insiders （如果code命令不可用就用这个）

    sudo apt install cmake g++ make mysql-server
    （安装一些其他可能会用到的工具）
然后在vs code中按`Ctrl+Shift+P`调出命令面板，输入并选择`Remote-WSL: New Window`，就可以啦，然后在打开的页面中打开Ubuntu里的文件夹就好啦

## 启用WSL
可通过下列命令进行一些基础操作（在PowerShell中，如果命令失败就以管理员身份运行PowerShell）：
* **安装**WSL：`wsl --install`
* 检查WSL版本：`wsl --version --verbose`或`wsl --list --verbose`
* 更新WSL：`wsl --update`
* 如果WSL已安装但未升级：`wsl -- set-default-version 2`
* **启动**WSL：`wsl` （默认会直接启动Ubuntu，如果安装了的话）
* 进入项目：`cd /root/your-project`
* 返回上级目录：`cd ..`