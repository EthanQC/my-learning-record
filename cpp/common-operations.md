### 安装
Ubuntu 自带 cpp，只要安装编译器就行
* 安装 g++：`sudo apt install build-essential`
* 检查是否安装成功并查看版本信息：`g++ --version`

### 安装扩展
安装 vs code 中 C/C++ 的官方扩展包即可，也可以按需安装其他调试工具

### 运行
* 编译单个文件并执行：
    * `g++ main.cpp -o main` `./main`
    * `g++ main.cpp -o main && ./main`
    * 上面的命令是将 main 文件编译为名字为 main 的 可执行文件