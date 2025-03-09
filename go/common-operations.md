### 安装
* 通过 Ubuntu 的默认仓库安装：`sudo apt install golang -y`
    * 一般不是最新版本，但也不会是特别老的版本
    * 怎么更新等后面要用到的时候我再研究~
* 安装完成后验证一下：`go version`
* 在 vs code 中安装 go 扩展
* vs code 会提示安装一些工具，但国内可能被墙，需要切换模块代理：`go env -w GOPROXY=https://goproxy.io,direct`
* 再重新尝试安装：`go install -v golang.org/x/tools/gopls@latest`、
`go install -v honnef.co/go/tools/cmd/staticcheck@latest`
    * 可能要等一会才能装好

### 运行
* 直接运行：`go run xxx.go`
* 生成可执行文件并运行：`go build xxx.go`、`./main`
