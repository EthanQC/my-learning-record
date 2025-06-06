## 一些终端命令
#### 分支相关
* 查看当前分支：`git branch`
* 查看远程分支：`git branch -r`
* 查看本地和远程分支：`git branch -a`
* 删除某个分支：`git branch -D branch1`
* 重命名当前分支：`git branch -m branch`
* 撤销合并分支：`git merge --abort`
* 推送新建的分支并设置对应的远程分支：`git push --set-upstream origin new branch name`
* 切换到本地有的分支：`git switch branch name`
* 切换到本地没有远程有的分支：`git checkout branch name`
* 创建并切换分支：`git switch -c new branch name`

#### 推送拉取相关
* 推送代码到远程仓库：`git push origin main`
* 本地拉取同步远程仓库：`git fetch`
* 确保本地的主分支是最新的：`git pull origin main`
* 强制推送：`git push --force`
* 强制推送到远程，覆盖远程分支历史（更安全）：`git push origin pre --force-with-lease`
    * 注意需要先拉取远程最新信息 `git fetch origin` 然后切换到想要更改的分支
    * 适用于不小心合错了分支但还没推送到远程

#### 提交合并相关
* 合并新分支到主分支：`git merge new-branch`（合并后要处理冲突才能完成合并）
* 提交修改：`git commit`
* 查看状态、确认是否有冲突：`git status`
* 强制合并：`git merge branch --allow-unrelated-histories`
* 将某次特定 commit 从一个分支迁到另一个分支而不是合并分支：`git cherry-pick <commit-hash>` `git cherry-pick <commit1> <commit2> <commit3> ...`
    * **开发时一定要看清楚自己是在编辑哪个分支，换环境切换分支了记得要切换回平时开发环境的分支**
* 连续的 cherry-pick：`git cherry-pick <commit-hash>^..<commit-hash>`，其中第一个是较早的，第二个是较晚的，中间连续的所有 commit 都会被迁移
* 用 `reset --hard` 回退到想要的那个提交：`git reset --hard <commit-before-merge>`

#### 配置远程相关
* 删除旧的远程仓库关联：`git remote remove origin`
* 删除当前的.git文件夹并清除所有git 的历史记录：`Remove-Item -Recurse -Force .git`
* 将远程仓库地址关联改为使用SSH：
`git remote set-url origin git@github.com:yourUsername/yourRepo.git`
* 验证SSH是否配置成功：`ssh -T git@github.com`
* 检查vs code是否默认使用SSH：`git remote -v`

#### 初始化
* 当前文件夹初始化Git：`git init`

## 常见操作教程
#### 如何在国内将项目用vs code托管在GitHub上
我使用的是**ssh**，通过在命令行输入：`ssh-keygen -t rsa -b 4096 -C "你的GitHub邮箱"`和`cat ~/.ssh/id_rsa.pub`，然后复制输出的内容，打开[GitHub SSH配置页面](https://github.com/settings/keys)，粘贴公钥，再通过这个：`git remote set-url origin git@github.com:yourAccount/yourRepo`修改仓库地址为ssh，就好啦

需要注意的是GitHub默认上传的文件不能大于100M，如果比这个大就会上传失败，需要使用一些别的方法，比如gitignore什么的（但我是直接不传那么大的了哈哈哈，所以别的方法具体我也没试过）

vs code默认使用的是HTTPS，但我不知道为什么我的HTTPS的token一直不行，配置了好久也还是连接失败（我可以确定我的梯子没问题），可能是校园网的问题，所以索性就直接用ssh了

可以通过：`git config --global url."git@github.com".insteadOf "https://github.com/"`，将所有的`https://github.com/` URL 自动替换为 `git@github.com:`，从而配置vs code默认使用ssh，而不是HTTPS；也可以在 vs code 的设置里面搜索 git 来修改默认克隆方式

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
