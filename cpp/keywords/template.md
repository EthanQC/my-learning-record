模板是 C++ 提供的泛型编程工具，用来编写通用代码。通过模板，你可以为不同的数据类型编写通用的算法或类，而无需重复代码。

## 模板的基本概念
#### 1. 函数模板
用于定义一组函数，而无需指定具体的数据类型。

语法：

    template<typename T>
    返回类型 函数名(参数列表)
    {
        // 函数实现
    }

示例：

    template<typename T>
    T add(T a, T b)
    {
        return a + b;
    }

    int main()
    {
        std::cout << add<int>(3, 5) << std::endl;  // 显式指定模板参数 T 为 int
        std::cout << add(3.5, 2.5) << std::endl;  // 编译器自动推导 T 为 double
        return 0;
    }

#### 2. 类模板
用于定义一组通用类。

语法：

    template<typename T>
    class 类名
    {
        // 类的实现
    };

示例：

    template<typename T>
    class MyClass
    {
    private:
        T data;

    public:
        MyClass(T val) : data(val) {}
        void print() { std::cout << data << std::endl; }
    };

    int main()
    {
        MyClass<int> obj1(10);   // 使用 int 实例化
        obj1.print();            // 输出 10

        MyClass<std::string> obj2("Hello");
        obj2.print();            // 输出 Hello

        return 0;
    }

#### 3. 模板特化
有时候，需要**为某些特定类型提供特殊的实现**，可以使用模板特化。

语法：

    template<>
    class 类名<特定类型>
    {
        // 特定类型的实现
    };

示例：

    template<typename T>
    class MyClass
    {
    public:
        void print() { std::cout << "General template" << std::endl; }
    };

    // 为 int 类型提供特化版本
    template<>
    class MyClass<int>
    {
    public:
        void print() { std::cout << "Specialized template for int" << std::endl; }
    };

    int main()
    {
        MyClass<double> obj1;
        obj1.print();  // 输出 General template

        MyClass<int> obj2;
        obj2.print();  // 输出 Specialized template for int

        return 0;
    }

## 模板进阶概念
#### 1. 模板偏特化
为某些特殊类型的模板参数提供特殊实现。类似于模板特化。

示例：

    template<typename T, typename U>
    class MyClass
    {
    public:
        void print() { std::cout << "General template" << std::endl; }
    };

    // 偏特化：当两个模板参数类型相同时
    template<typename T>
    class MyClass<T, T>
    {
    public:
        void print() { std::cout << "Partial specialization for same types" << std::endl; }
    };

    int main()
    {
        MyClass<int, double> obj1;
        obj1.print();  // 输出 General template

        MyClass<int, int> obj2;
        obj2.print();  // 输出 Partial specialization for same types

        return 0;
    }

#### 2. 模板与非类型参数
模板参数不仅可以是类型，还可以是常量值。

示例：

    template<typename T, int N>
    class Array
    {
    private:
        T data[N]; //类型为T的数组，大小为模板非类型参数N，可以动态指定N的值，但N必须为常量
    public:
        int size() { return N; }
    };

    int main()
    {
        Array<int, 10> arr;
        std::cout << "Array size: " << arr.size() << std::endl;  // 输出 10
        return 0;
    }

#### 3. typename 和 class 的区别
在模板定义中，typename 和 class 是**等价**的，可以互换使用。

    template<class T>
    void func1(T val) {}

    template<typename T>
    void func2(T val) {}

在模板**内部**，当使用**嵌套依赖类型**时，必须使用 typename 表示某个名字是类型，而非变量或函数：

    template<typename T>
    void func()
    {
        typename T::type val;  // 告诉编译器，T::type 是一个类型
    }

##### 什么是嵌套依赖类型？
在模板编程中，当**一个类型本身是模板参数的成员**时，我们称之为嵌套依赖类型（Nested Dependent Types）。这种类型的定义依赖于模板参数，因此在编译时可能无法直接推断出它的确切含义。

##### 为什么需要 typename？
C++ 编译器在解析嵌套依赖类型时，可能会误将嵌套类型视为变量或静态成员，而不是类型。为了避免这种歧义，需要使用 typename 关键字显式地告诉编译器，这个名字是一个类型。

示例：没有 typename 的错误

    template <typename T>
    class MyClass
    {
    public:
        typename T::type value;  // 告诉编译器 T::type 是一个类型
    };

如果省略 typename：

    template <typename T>
    class MyClass
    {
    public:
        T::type value;  // 错误！编译器认为 T::type 是变量或静态成员
    };

嵌套依赖类型的完整示例：**如何传入一个vector容器**

    #include <iostream>
    #include <vector>

    template <typename T>
    class Wrapper
    {
    public:
        typename T::value_type element;  // 嵌套依赖类型

        Wrapper(const T& container)
        {
            if (!container.empty())
            {
                element = container[0];  // 取容器的第一个元素
            }
        }

        void print()
        {
            std::cout << "Element: " << element << std::endl;
        }
    };

    int main()
    {
        std::vector<int> vec = {1, 2, 3};
        Wrapper<std::vector<int>> wrapper(vec);  // T 是 std::vector<int>
        wrapper.print();  // 输出 Element: 1
        return 0;
    }

#### 4. 模板的优点和缺点
优点：

* 提供了代码的泛化能力。
* 避免重复代码，提升代码复用性。

缺点：

* 编译时间较长。
* 错误信息可能不直观，调试复杂。