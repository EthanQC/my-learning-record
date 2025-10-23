### 安装
* 通过 Ubuntu 的默认仓库安装：`sudo apt install golang -y`
    * 一般不是最新版本，但也不会是特别老的版本
    * 怎么更新等后面要用到的时候我再研究~
* 安装完成后验证一下版本：`go version`
* 在 vs code 中安装 go 扩展
* vs code 会提示安装一些工具，但国内可能被墙，需要切换模块代理：`go env -w GOPROXY=https://goproxy.io,direct`
* 再重新尝试安装：`go install -v golang.org/x/tools/gopls@latest`、
`go install -v honnef.co/go/tools/cmd/staticcheck@latest`
    * 可能要等一会才能装好

### 切换 go 代理为国内镜像源
如果发现在使用 `go get` 指令安装某个包时命令行卡住或提示超时，可以使用下面这个镜像源防止被墙

`go env -w GOPROXY=https://goproxy.cn,direct`

### 安装扩展
vs code 中有一系列 go 相关的扩展，可凭需求安装，推荐谷歌官方扩展

### 运行
* 直接运行：`go run xxx.go`
* 生成可执行文件并运行：`go build xxx.go`、`./main`

### 工具
* 初始化 go 模块管理：`go mod init`
* 清理/自动安装包：`go mod tidy`