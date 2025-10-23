---
title: '`noexcept` 详解'
date: '2025-09-03'
tags:
  - keywords
summary: 如果函数声明为 `noexcept`，它表示函数内部不会抛出异常。
---
# `noexcept` 详解
`noexcept` 是 C++11 引入的一个关键字，用来**明确声明某个函数不会抛出异常**。它的作用不仅是提高代码的可读性和安全性，同时也可以帮助编译器进行优化，从而提升程序的性能。

## 1. noexcept的基本作用

##### 表明函数不会抛出异常：

如果函数声明为 `noexcept`，它表示函数内部不会抛出异常。

编译器会信任这个声明，从而避免生成与异常处理相关的代码，优化性能。

##### 提供接口稳定性：

当一个函数明确声明为 `noexcept` 时，用户调用这个函数时可以确信它不会抛出异常，从而更容易编写鲁棒性代码。

##### 影响 STL 容器行为：

一些 STL 容器（如std::vector）在执行某些操作（如元素移动）时，会**优先选择** `noexcept` 的移动构造函数。如果移动构造函数没有声明为 noexcept，容器可能会退而选择更昂贵的拷贝构造函数。

## 2. noexcept的语法

##### 函数声明

    void func() noexcept;  // 表示 func 不会抛出异常
    void func();           // 普通函数，可能抛出异常

##### 条件性 `noexcept`
`noexcept` 还可以带一个条件表达式，**在运行时动态判断**函数是否可能抛出异常：


    void func() noexcept(true);   // 明确不会抛出异常
    void func() noexcept(false);  // 明确可能抛出异常

    template<typename T>
    void func() noexcept(std::is_nothrow_move_constructible<T>::value);

***

###### std::is_nothrow_move_constructible<T>::value：
>
>std::is_nothrow_move_constructible<T>：
>
>它是 C++ 标准库 <type_traits> 中的一个模板元函数，用来检测类型T是否具有不抛异常的移动构造函数。
>
>如果类型T的移动构造函数声明为noexcept，这个模板会返回true。
>
>.value：
>
>std::is_nothrow_move_constructible<T> 的静态成员，表示模板检测的结果，是一个布尔值（true 或 false）。

## 3. 为什么要用 `noexcept`

* 性能优化：当函数声明为 `noexcept` 时，编译器会优化异常处理相关的代码（如栈展开等），提高运行效率。
在 STL 容器中，优先选择 noexcept 的移动构造函数，从而避免不必要的拷贝操作。

* 程序安全性：如果一个函数**本身设计就不应该抛出异常**，使用 `noexcept` 明确这一点，可以防止因误操作导致的意外异常抛出。

* 如果一个 `noexcept` 函数抛出了异常，程序会立即调用 `std::terminate()` 终止运行，避免程序进入不确定状态。

## 4. 如何判断一个函数是否是 `noexcept`
可以使用 `noexcept` 运算符来检测一个函数是否被声明为 `noexcept`：

    # include <iostream>

    void func1() noexcept
    {
        // 不抛出异常
    }

    void func2()
    {
        // 可能抛出异常
    }

    int main()
    {
        std::cout << std::boolalpha;
        std::cout << "func1 is noexcept: " << noexcept(func1()) << std::endl;  // 输出 true
        std::cout << "func2 is noexcept: " << noexcept(func2()) << std::endl;  // 输出 false
        return 0;
    }

***

>`std::boolalpha`是C++ 中的一个 流操作符，用于控制布尔值的输出格式。通过它，可以将布尔值（true 或 false）以文字形式输出，而不是以数字形式（1 或 0）
>
>std::cout << std::boolalpha —— 输出 true / false
>
>std::cout << std::noboolalpha —— 输出1 / 0

## 5. `noexcept` 在 STL 中的应用

在 C++ 标准模板库（STL）中，例如 `std::vector、std::deque` 等，移动操作的效率通常高于拷贝操作。

如果元素的移动构造函数没有声明为 `noexcept`，这些容器在扩容或重新排列时，可能会选择更安全的拷贝构造函数，而不是移动构造函数。

这是因为如果移动构造函数抛出异常，会导致容器的状态变得不一致。

示例：

    # include <vector>
    # include <iostream>
    # include <utility>

    class MyClass
    {
    public:
        MyClass() {}

        MyClass(const MyClass&)
        {
            std::cout << "Copy Constructor" << std::endl;
        }

        MyClass(MyClass&&) noexcept
        {
            std::cout << "Move Constructor (noexcept)" << std::endl;
        }
    };

    int main()
    {
        std::vector<MyClass> vec;
        vec.reserve(2);

        // 容器扩容时会使用移动构造函数，而不是拷贝构造函数
        vec.emplace_back();  // 调用 Move Constructor
        return 0;
    }

输出：


    Move Constructor (noexcept)
    Move Constructor (noexcept)

如果没有 `noexcept` 声明，输出可能包含拷贝构造函数调用。

## 6. `noexcept` 和 `throw()` 的区别

`throw()` 是 C++98 中的异常规范，用来声明函数不会抛出异常，在 C++11 中已被废弃，不推荐使用。

语法：

    void func() throw();  // 声明 func 不会抛出异常

##### `noexcept` 的优势

* `noexcept` 更灵活，可以通过条件表达式动态判断是否抛出异常。

* 而 `throw()` 在编译期和运行时都有较多限制，`noexcept` 更高效。

* `throw()` 声明不匹配时，程序行为未定义，而 `noexcept` 会调用 `std::terminate()`。

## 7. 注意事项
`noexcept` 适用于**确实不会**抛出异常的函数。

对可能抛出异常的函数错误地使用 `noexcept` 会**隐藏错误**，导致程序直接终止。

在模板函数中，建议**结合 `std::is_nothrow_*` 系列类型检测**（如 `std::is_nothrow_move_constructible`）使用。
示例：

    template<typename T>
    void func() noexcept(std::is_nothrow_move_constructible<T>::value);

8. 示例：综合演示

        # include <iostream>
        # include <vector>
        # include <type_traits>

        class MyClass
        {
        public:
            MyClass() {}

            MyClass(const MyClass&)
            {
                std::cout << "Copy Constructor" << std::endl;
            }

            MyClass(MyClass&&) noexcept
            {
                std::cout << "Move Constructor (noexcept)" << std::endl;
            }
        };
        
        int main()
        {
            MyClass a;
            MyClass b = std::move(a);  // 调用移动构造函数

            std::cout << std::boolalpha;
            std::cout << "MyClass is noexcept move constructible: "
                    << std::is_nothrow_move_constructible<MyClass>::value << std::endl;

            return 0;
        }

输出：

    Move Constructor (noexcept)
    MyClass is noexcept move constructible: true

## 9. 总结

* `noexcept` 的用途：

    * 声明函数不会抛出异常。

    * 优化性能，帮助 STL 容器更高效地使用移动语义。

* `noexcept` 的安全性：

    * 如果抛出异常，程序会终止运行，保证一致性。

* 如何使用：

    * 声明 `noexcept` 函数，确保设计的函数不抛异常。

    * 在模板中结合类型特性检查条件性 `noexcept`。
