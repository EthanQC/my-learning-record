## 一些知识

### 可能会用到的基础知识

#### 特殊词汇
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
* 检查WSL版本：`wsl --version --verbose`
* 更新WSL：`wsl --update`
* 如果WSL已安装但未升级：`wsl -- set-default-version 2`
* **启动**WSL：`wsl` （默认会直接启动Ubuntu，如果安装了的话）

vs code提供了**Remote - WSL**扩展插件，允许在其中远程连接到WSL，提供了类似图形化的体验（我个人觉得是非常好用的，也不用盯着黑乎乎的命令行了哈哈哈）
在WSL中安装vs code的辅助工具（在Ubuntu终端中）：

    sudo apt update
    sudo apt install code
    sudo apt install code-insiders （如果code命令不可用就用这个）

>`sudo`：全称*superuser do*，是在Linux系统中用于以超级用户权限（root）运行命令的工具，即类似于管理员权限，有些操作是普通权限无法直接执行的

然后在vs code中按`Ctrl+Shift+P`调出命令面板，输入并选择`Remote-WSL: New Window`，就可以啦，然后在打开的页面中打开Ubuntu里的文件夹就好啦

##### WSLg
是微软为WSL2提供的内置图形界面支持，允许直接允许运行Linux GUI(graphic user interface，好像是这样拼的，不太确定，反正就是用户图形界面的意思哈哈哈)

WSLg默认在最新的 Windows 11 更新中启用，但我并没有安装特别多的GUI应用程序，下面提供一个例子：

在终端中输入下面命令安装`gedit`文本编辑器：

    sudo apt update
    sudo apt install gedit
    gedit

这会在Windows上显示gedit的图形界面

##### Ubuntu
Ubuntu是Linux的一个非常流行的发行版，也是WSL支持的多个Linux发行版之一

可以通过直接在Microsoft Store（可能要挂梯子，反正我是挂了梯子才成功打开了这玩意）中搜索Ubuntu来安装发行版，通常22版的会比较稳定和安全，24版的就是最新的目前；安装完成后可以在命令行中启动Ubuntu，进入Ubuntu的命令行环境

