---
title: functional
date: '2025-09-03'
tags:
  - hpp
summary: >-
  它允许你将**任何可调用对象**（如普通函数、lambda表达式、函数指针、成员函数指针等）存储在一个对象中。`std::function`可以接受多种类型的函数，并提供了**统一的调用接口**。
---
## `<functional>`
`function`是cpp11中引入的一个通用多态的**函数封装器**，是`functional`头文件中提供的**模板**，用来统一封装具有**同种返回值、参数类型**但**不同的可调用对象**（函数、lambda等）

它允许你将**任何可调用对象**（如普通函数、lambda表达式、函数指针、成员函数指针等）存储在一个对象中。`std::function`可以接受多种类型的函数，并提供了**统一的调用接口**。

语法：`std::function<返回类型(参数类型列表)> 可调用对象名`

`<functional>`是C++标准库中的一个头文件，它定义了与函数对象（函数指针、lambda表达式、绑定表达式等）相关的模板类和函数。它提供了多种工具，例如`std::function、std::bind、std::mem_fn`等。

示例：

    # include <iostream>
    # include <functional>

    void greet(int x)
    {
        std::cout << "Hello, " << x << std::endl;
    }

    int main()
    {
        // 使用std::function包装函数
        std::function<void(int)> func = greet;
        func(5);  // 调用greet(5)
        
        // 使用lambda表达式
        std::function<int(int, int)> add = [](int a, int b) { return a + b; };
        std::cout << add(3, 4) << std::endl;  // 输出 7

        return 0;
    }

在这个例子中，`std::function<void(int)>` 和 `std::function<int(int, int)>`分别接受不同的函数签名，允许你将普通函数、lambda等传递给它。
