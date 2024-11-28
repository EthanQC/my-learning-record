## 一些知识
### 特殊词汇
**终端**：是一个接口，提供输入输出功能，本质是一个运行**Shell**或**命令行工具**的窗口

**Shell**：是一个命令解释器，负责将用户输入的命令翻译为系统能够执行的操作，提供了一种与操作系统内核交互的方式，Linux中使用的是**Bash**（Bouren Again Shell），Windows中使用的是**PowerShell**

**命令行**：是用户通过键盘输入指令，与操作系统交互的方式，通常在终端中运行，由Shell提供支持，用于执行系统操作、运行脚本和管理文件

**cmd**：是Windows系统的命令提示符，是Windows自带的Shell，是Windows系统中最早期的命令行工具

### Linux
Linux是一个开源的操作系统内核，通常我们所说的Linux实际上是**Linux发行版**，是在内核基础上结合了各种*软件包、工具和桌面环境*构建而成的完整操作系统

就像Windows一样，Linux下有多个不同的发行版，有一些拥有图形化和可交互的用户界面，我使用的是WSL2下的Ubuntu22

在实际开发和部署中，Linux由于其：
* 资源管理和性能优化方面的优异表现、服务器软件的运行效率
* 丰富的开源生态和工具链、高度的灵活性和可定制性
* 容器化和虚拟化更好的支持

而被广泛使用，且适合高负载的服务器环境
#### WSL(Windows Subsystem for Linux)
WSL是微软做的一个适用于Linux的Windows子系统，能让开发者在不需要使用虚拟机或双启动的情况下使用Linux的工具和环境进行开发

WSL 1：通过翻译 Linux 系统调用到 Windows 系统调用，实现了与 Linux 的兼容性。它不包含完整的 Linux 内核，而是依赖于 Windows 的内核来执行 Linux 命令
WSL 2：引入了一个真正的 Linux 内核，运行在一个轻量级的虚拟机中。这样，WSL 2 提供了更高的兼容性和性能，支持更多的 Linux 应用和功能

可通过下列命令进行一些基础操作（在PowerShell中，如果命令失败就以管理员身份运行PowerShell）：
* **安装**WSL：`wsl --install`
* 检查WSL版本：`wsl --version --verbose`或`wsl --list --verbose`
* 更新WSL：`wsl --update`
* 如果WSL已安装但未升级：`wsl -- set-default-version 2`
* **启动**WSL：`wsl` （默认会直接启动Ubuntu，如果安装了的话）
* 进入项目：`cd /root/your-project`
* 返回上级目录：`cd ..`

vs code提供了**Remote - WSL**扩展插件，允许在其中远程连接到WSL，提供了类似图形化的体验（我个人觉得是非常好用的，也不用盯着黑乎乎的命令行了哈哈哈）
在WSL中安装vs code的辅助工具（在Ubuntu终端中）：

    sudo apt update
    sudo apt install code
    sudo apt install code-insiders （如果code命令不可用就用这个）

    sudo apt install cmake g++ make mysql-server（安装一些其他可能会用到的工具）

>**sudo**：全称*superuser do*，是在Linux系统中用于以超级用户权限（root）运行命令的工具，即类似于管理员权限，有些操作是普通权限无法直接执行的
>**apt**：全称*advanced package tool*，是Linux发行版中用来管理软件包的命令行工具，可以通过用它来安装、升级、删除以及管理系统中的软件包

然后在vs code中按`Ctrl+Shift+P`调出命令面板，输入并选择`Remote-WSL: New Window`，就可以啦，然后在打开的页面中打开Ubuntu里的文件夹就好啦
##### WSLg
是微软为WSL2提供的内置图形界面支持，允许直接允许运行Linux GUI(graphic user interface，好像是这样拼的，不太确定，反正就是用户图形界面的意思哈哈哈)

WSLg默认在最新的 Windows 11 更新中启用，但我并没有安装特别多的GUI应用程序，下面提供一个例子：

在终端中输入下面命令安装`gedit`文本编辑器：

    sudo apt update
    sudo apt upgrade
    sudo apt install gedit
    gedit

这会在Windows上显示gedit的图形界面
##### Ubuntu
Ubuntu是Linux的一个非常流行的发行版，也是WSL支持的多个Linux发行版之一

可以通过直接在Microsoft Store（可能要挂梯子，反正我是挂了梯子才成功打开了这玩意）中搜索Ubuntu来安装发行版，通常22版的会比较稳定和安全，24版的就是最新的目前；安装完成后可以在命令行中启动Ubuntu，进入Ubuntu的命令行环境

常用命令：
* 安装MySQL：`sudo apt install mysql-server`
* 启动MySQL：`sudo service mysql start`
* 登录MySQL：`sudo mysql -u root -p`
* 查看当前目录下所含文件：`ls`
* 查看python版本：`python3 --version`
* 激活虚拟环境：`source /path/to/your/venv/bin/activate`
* 退出虚拟环境：`deactivate`

### Git和GitHub
#### Git
简单来说，git其实就是一个版本控制和管理项目及其源代码的工具，它是本地的，运行在你的电脑上，有一系列的指令来帮助你使用这个工具
#### GitHub
而GitHub就相当于是git的线上版，并且是海外版（有些时候国内需要挂梯子才上的去），国内的叫做*Gitee*，好像也有一些人和开源平台在用（但我个人感觉整体上还是不如GitHub，毕竟看了那么多帖子都在说国内的开源道路还有很长的路要走）
#### 如何在国内将项目用vs code托管在GitHub上
我使用的是**ssh**，通过在命令行输入：`ssh-keygen -t rsa -b 4096 -C "你的GitHub邮箱"`和`cat ~/.ssh/id_rsa.pub`，然后复制输出的内容，打开[GitHub SSH配置页面](https://github.com/settings/keys)，粘贴公钥，再通过这个：`git remote set-url origin git@github.com:yourAccount/yourRepo`修改仓库地址为ssh，就好啦

需要注意的是GitHub默认上传的文件不能大于100M，如果比这个大就会上传失败，需要使用一些别的方法，比如gitignore什么的（但我是直接不传那么大的了哈哈哈，所以别的方法具体我也没试过）

vs code默认使用的是HTTPS，但我不知道为什么我的HTTPS的token一直不行，配置了好久也还是连接失败（我可以确定我的梯子没问题），可能是校园网的问题，所以索性就直接用ssh了

可以通过：`git config --global url."git@github.com".insteadOf "https://github.com/"`，将所有的`https://github.com/` URL 自动替换为 `git@github.com:`，从而配置vs code默认使用ssh，而不是HTTPS

配置了ssh之后，在本地克隆仓库时就要复制仓库的ssh的url，然后再粘贴到vs code里面，就可以克隆啦，如果是本地想让vs code远程创建的话，需要先配置好git中的账户名和邮箱：

    git config --global user.name "Your Name"
    git config --global user.email "your-email@example.com"

然后就可以本地创建完之后直接推送啦
#### 使用SSH远程控制Linux系统
先在Ubuntu上安装OpenSSH服务并检查SSH状态，以及启动、获取Ubuntu的IP地址：

    sudo apt update
    sudo apt install openssh-server
    sudo systemctl status ssh
    sudo systemctl enable ssh
    sudo systemctl start ssh
    ip addr（其中类似于192.168.x.x的就是，通常在eht0或wlan0接口下）

然后在Windows上安装SSH客户端（通常自带），打开powershell或cmd输入：
`ssh username@192.168.x.x`
再输入密码就可以啦，这种方法远程控制的是一个命令行窗口，而不是图形化界面

可以通过`scp /path/to/local/file.txt username@192.168.x.x:/home/username/`或`scp -r D:\yourFile username@192.168.x.x:~/xxx`来远程将Windows的文件传输到Ubuntu上

也可以用`scp /path/to/your/file username@windows_ip:/path/to/windows/folder`来远程将Ubuntu的文件传到Windows上
#### 一些终端命令
* 删除旧的远程仓库关联：`git remote remove origin`
* 删除当前的.git文件夹并清除所有git 的历史记录：`Remove-Item -Recurse -Force .git`
* 当前文件夹初始化Git：`git init`
* 将远程仓库地址关联改为使用SSH：
`git remote set-url origin git@github.com:yourUsername/yourRepo.git`
* 验证SSH是否配置成功：`ssh -T git@github.com`
* 检查vs code是否默认使用SSH：`git remote -v`
* 推送代码到远程仓库：`git push origin main`
* 本地拉取同步远程仓库：`git fetch`
* 切换到主分支操作：`git checkout main`
* 确保本地的主分支是最新的：`git pull origin main`
* 合并新分支到主分支：`git merge new-branch`（合并后要处理冲突才能完成合并）
* 提交修改：`git commit`
* 查看状态、确认是否有冲突：`git status`
* 强制推送：`git push --force`
* 查看远程分支：`git branch -r`
* 强制合并：`git merge branch --allow-unrelated-histories`
* 删除某个分支：`git branch -D branch1`
* 重命名当前分支：`git branch -m branch`
* 撤销合并分支：`git merge --abort`

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

### Anaconda
Anaconda本身我觉得是一个环境管理器，是帮助开发者配置环境的，然后还可以下载一些配套的工具，比如jupyter notebook什么的
（我自己用这个工具用的并不多，是计网做实验要求安装的哈哈哈哈哈，还顺带安装了pycharm，用得也不多，个人感觉其实没有vs code好用，就不过多记录啦）

## 碎碎念
关于webServer项目，目前已经将项目完整测试过一遍，跑通没问题，接下来会重新在Linux环境下根据文档进一步修改项目，当然在这之前会先把项目拆分成几个模块，然后把每个模块的代码读一遍，吃透了再修改、扩展

关于tennis项目，准备是有空的话再抽时间去看一下安卓端的代码，然后慢慢学，目前不准备把重心放这个上面啦，因为本身这个项目重点也偏算法，更何况他们已经用Java重写了一遍，这就导致跟我的方向和技术栈完全不匹配了，但我也不会直接退出，还是会看他们后面需要人做什么，然后我再做一些力所能及的事情吧

呼，可算是写完啦，这个记录也相当于是对于上周和上上周的总结啦，其实还有很多东西是我省略了的或者没写的，比如flask框架，比如对于tennis项目问题的排查，说真的这俩感觉占了特别多的时间，最后排查下来也只是感觉是线程冲突或者flask跟web-socket不兼容，或者flask根本不适合跑这种，但最后也没有确定或者解决，就直接全改Java了

anyway，我这周末应该会把前天看了好久的开源相关的记录一下，然后再把这段时间学的HTML和CSS记录一下，就差不多啦，然后后面再根据进度更新记录~

生活方面，我应该还是先不在这里过多写了，主要是我的很多情绪都是比较碎片化的哈哈哈，时间一久不但不想写了而且还想不起来了，所以我们还是专心学习吧！至少在这里是这样~

噢对，我应该也会抽时间去做双城之战的混剪，但应该也是在二刷完之后了，最近学校的课又忙起来了，有好多实验啊作业啊什么的，所以我估计也没那么快

经过最近这半个月的波动之后，我感觉我最开始的想法还是正确的，就是如果想快速找到实习，必须是在实战中学习，非科班（虽然电子信息跟计算机已经算靠近的了）只能这样，然后自己去看去搜集各种信息、项目，才能快速成长到符合企业招人的要求，所以我接下来重心还是会放在webServer项目和深入cpp上，前端技术栈的学习次之，再后面才是学校作业和tennis项目，至于算法题的话，还是碎片时间刷一下吧，可能寒假的时候会重点刷，刚好备战蓝桥杯，现在还是太忙了没办法投入大片时间给它

今晚要去吃椰子鸡啦！开心！！！😍😍

继续加油~