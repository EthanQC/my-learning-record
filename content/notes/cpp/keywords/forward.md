---
title: forward
date: '2025-09-03'
tags:
  - keywords
summary: '`std::forward` 和其他类似工具（如`std::move`）都在 **`<utility>`** 头文件中，使用时需要包含。'
---
## `std::forward` 
`std::forward` 是 C++11 引入的一个函数模板，用来实现**完美转发**。完美转发的核心目标是**保持函数参数的值类别（左值或右值）特性，确保参数在被转发时不会发生不必要的拷贝或转换**。

`std::forward` 和其他类似工具（如`std::move`）都在 **`<utility>`**  头文件中，使用时需要包含。

## 用法
`std::forward` 可以用来在模板中转发函数参数，同时保留参数的值类别：

* 左值参数会被转发为左值。

* 右值参数会被转发为右值。

## 语法

    std::forward<T>(param);

* T：模板参数的类型。

* param：需要转发的参数。

## 原理
`std::forward` 是一个条件转发器，它通过 T 的类型判断 param 是左值还是右值，并将其正确地转发。

示例

    # include <iostream>
    # include <utility>  // std::forward

    void process(int& x)
    {
        std::cout << "Lvalue processed: " << x << std::endl;
    }

    void process(int&& x)
    {
        std::cout << "Rvalue processed: " << x << std::endl;
    }

    template<typename T>
    void forwarder(T&& arg)
    {
        process(std::forward<T>(arg));  // 使用 std::forward 保留参数的值类别
    }

    int main()
    {
        int a = 10;
        forwarder(a);          // 左值传递
        forwarder(20);         // 右值传递
        return 0;
    }

输出结果

    Lvalue processed: 10
    Rvalue processed: 20
    
##### 解释
forwarder(a)：

* **a 是一个左值**。

* T 被推导为 int&。

* `std::forward<T>(arg)` 转发为左值。

forwarder(20)：

* 20 是一个右值。

* T 被推导为 int（右值引用）。

* `std::forward<T>(arg)` 转发为右值。

##### 为什么不直接用 `std::move` ？
`std::move` 会将参数**无条件**地转换为右值，即使是左值。

而 `std::forward` 能够**根据模板参数类型（T）的实际情况来决定是左值还是右值**，确保完美转发。
