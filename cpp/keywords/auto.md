## **`auto`** 简介
 **`auto`** 是C++11引入的关键字，允许编译器**自动推导变量的类型**
 
 使用 **`auto`** 时，编译器根据**变量的初始化值**来确定变量的类型，这使得代码更加简洁，尤其是在处理复杂类型（如迭代器）时

例如：

    int a = 10;
    auto b = a;  // b的类型会被推导为int
    std::cout << b;  // 输出10

对于迭代器：

    std::vector<int> v = {10, 20, 30};
    auto it = v.begin();  // it的类型会被推导为std::vector<int>::iterator
    std::cout << *it;  // 输出10

 **`auto`** 让代码更加简洁，避免了显式地指定复杂的类型，尤其是在需要与STL容器和迭代器一起使用时非常有用

## **`auto`** 推导引用和指针
如果初始化值是引用， **`auto`** 会推导出变量为**引用类型**

需要特别注意的是，如果你使用了引用， **`auto`** 会将它推导成**常规引用或常量引用**，具体取决于初始化值的类型

    int a = 10;
    int& ref = a;
    auto x = ref;  // x为int类型（不是int&）

如果你希望**保留引用类型**，可以**显式指定auto&：**

    auto& y = ref;  // y为int&类型

**指针类型**：当使用指针初始化 **`auto`** 时， **`auto`** 会推导出指针类型

    int* p = &a;
    auto z = p;  // z的类型为int*

## **`auto`** 的限制条件和注意事项
#### 不能不初始化
 **`auto`** 关键字**不能用于未初始化的变量，必须通过初始化来推导类型**
 
 如果没有提供初始化值，编译器无法推导出变量的类型，编译将失败

    auto x;  // 错误，编译时会报错，必须提供初始化值

#### **`auto`** 不能推导为 **`void`**
 **`auto`** 不能用来推导类型为 `void`
 
 `void` 表示没有类型，所以不能用 **`auto`** 推导

    auto x = void();  // 错误，编译时会报错

#### 推导常量值
 **`auto`** 会**忽略右侧常量的 const 修饰符**
 
 如果你希望**保持常量性质**，必须**显式**使用 **`const auto`** 

    const int x = 10;
    auto y = x;  // y被推导为int，不是const int

如果你想要 y 成为常量类型，需要使用：

    const auto y = x;  // y被推导为const int

#### 不能用 **`auto`** 的类型推导为数组类型
 **`auto`** 不能用来推导数组类型，因为数组类型有**特殊的存储和访问方式**
 
 对于数组， **`auto`** 将推导为**指向数组元素的指针**，而不是数组类型

    int arr[10] = {1, 2, 3};
    auto x = arr;  // x的类型为int*，而不是int[10]

如果你希望得到数组类型，需要使用 [`std::array`](https://github.com/EthanQC/my-learning-record/blob/main/cpp/STL/array.md) 或其他容器类型

***

###### 如何获取数组类型
>如果你想在使用 auto 的情况下获取数组类型，你可以使用**std::array**，它是一个标准库容器，支持数组类型的行为，并且能够与 auto 一起使用
>
>例如：

    #include <array>

    std::array<int, 3> arr = {1, 2, 3};
    auto x = arr;  // x的类型为std::array<int, 3>
    std::cout << x[0];  // 输出 1
    
>std::array 是一个固定大小的容器，它允许你得到一个确切的数组类型，而不是一个指向元素的指针，这使得auto可以正确推导出类型

***

#### 推导函数类型
 **`auto`** 也不能用于推导**函数类型**
 
 函数类型是一个比较复杂的类型，不仅包括函数的**返回类型**，还包括函数的**参数类型**
 
 编译器在推导时必须考虑到**参数的个数、类型以及返回值类型**，无法通过 **`auto`** 直接推导，只能推导匿名函数（如 lambda 表达式）或 `std::function` 类型

    auto func = [](){ return 10; };（lambda表达式）
    // 以上代码是正确的，但如果使用auto推导函数类型，不会适用

    auto add(int x, int y);  // 错误，不能推导函数类型

示例：

    #include <functional>
    #include <iostream>
    using namespace std;

    int add(int a, int b) { return a + b; }

    int main()
    {
        // 显式构造 std::function 对象（可以接受函数、lambda 或其他可调用对象）
        std::function<int(int, int)> funcObj = add;
        auto f1 = funcObj;  // 此时 f1 的类型为 std::function<int(int, int)>
        std::cout << "f1(2, 3) = " << f1(2, 3) << std::endl;
        
        // 注意：如果直接用 add 来初始化 auto 变量，则会推导为函数指针
        auto f2 = add;  // f2 的类型为 int (*)(int, int)
        std::cout << "f2(2, 3) = " << f2(2, 3) << std::endl;
        
        return 0;
    }

如果你想要使用 **`auto`** 推导函数类型，必须先明确**函数指针**或使用其他类型，`auto` **只能推导出指向函数的指针类型，而不能推导出函数本身的类型**

例如：

    int add(int a, int b)
    {
        return a + b;
    }

    auto func = add;  // 错误，不能用auto推导函数类型

你可以用 **`auto`** 推导**函数指针类型**：

    int add(int a, int b)
    {
        return a + b;
    }

    auto func = &add;  // func的类型为int(*)(int, int)

***

> **`auto`** 可以推导出 lambda 表达式的类型，因为 lambda 表达式本身会自动创建一个**匿名函数对象**，而这种对象的类型是**编译器自动生成的**
>
>C++ 并不要求你明确指定 lambda 的类型，你只需要使用 **`auto`** ，编译器会推导出该 lambda 的具体类型
>
>示例：

    auto lambda = [](int x, int y) { return x + y; };
    std::cout << lambda(3, 4);  // 输出 7

>在这个例子中， **`auto`** 推导出lambda表达式的类型，并且 lambda 成为一个匿名的函数对象

***

>**为什么 `auto` 能推导出Lambda表达式的类型？**
>
>这是因为lambda表达式在C++中本质上会创建一个**匿名的函数对象类**，编译器可以知道并推导出这个类型
>
>编译器生成的类型非常明确，并且可以通过auto推导出来

***

>**为什么auto不能推导其他函数类型？**
>
>auto不能推导其他函数类型（如普通函数）的原因是函数类型的特殊性
>
>函数类型包括**参数列表、返回类型**等信息，而这些信息对编译器来说较为复杂，尤其是**函数的参数是不同类型、不同数量的**，这使得编译器无法直接推导出函数类型
>
>例如，下面的代码会报错，因为auto不能推导出普通函数类型：

    int add(int a, int b) { return a + b; }
    auto func = add;  // 错误，auto不能推导函数类型

>[函数指针](https://github.com/EthanQC/my-learning-record/blob/main/cpp/copy-and-move-objects/function's-pointer.md#函数指针)是指向函数的指针，而auto只能推导出指向函数的指针类型，而不能直接推导出函数类型本身

***

#### 需要类型匹配
尽管 **`auto`** 会自动推导类型，但如果**初始化的类型不匹配**，编译器会报错

    auto x = 10;    // x为int类型
    auto y = 10.5;  // y为double类型

    x = y;  // 错误，不能将double赋给int类型

## 总结
 **`auto`** 在大多数情况下非常方便，可以让代码更简洁，避免显式声明复杂的类型

* 限制条件： **`auto`** 不能用于未初始化的变量、`void` 类型、数组类型推导、以及推导函数类型等
* 常见用途：最常见的用途是用来推导容器类型（例如 `vector` 的迭代器类型），或避免显式声明复杂的类型，常常需要和 `const`、`&`、`*` 等修饰符一起使用，以确保正确推导类型