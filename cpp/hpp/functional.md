### `<functional>`
`function`是cpp11中引入的一个通用多态的函数封装器，是`functional`头文件中提供的模板，用来统一封装具有同种返回值、参数类型但不同的可调用对象（函数、lambda等）

语法：`std::function<返回类型(参数类型列表)> 可调用对象名`