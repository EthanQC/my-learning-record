## 函数指针
函数指针（Function Pointer）是**指向函数的指针变量**，可以用它来调用函数

它保存了函数的地址，并允许**通过指针来调用函数**

函数指针的类型取决于被指向的函数的参数类型和返回类型

基本语法：

    返回类型 (*指针名)(参数类型);

示例：

    #include <iostream>

    int add(int a, int b)
    {
        return a + b;
    }

    int subtract(int a, int b)
    {
        return a - b;
    }

    int main()
    {
        // 声明一个函数指针，指向返回类型为int、参数类型为int, int的函数
        int (*func_ptr)(int, int);
        
        func_ptr = add;  // 指向add函数
        std::cout << func_ptr(5, 3) << std::endl;  // 输出 8

        func_ptr = subtract;  // 指向subtract函数
        std::cout << func_ptr(5, 3) << std::endl;  // 输出 2
        
        return 0;
    }

在这个例子中，`func_ptr` 是一个函数指针，指向一个返回int、接受两个int参数的函数

通过 `func_ptr` 指针，我们可以动态调用不同的函数（add或subtract）

## 解引用

解引用（Dereferencing）是指**通过迭代器或指针来访问指向的对象或数据**

在C++中，迭代器和指针类似，都指向容器中的元素或变量，而解引用就是通过它们访问或操作该元素的值

对于指针，解引用是使用 *  操作符，访问指针指向的值：

    int a = 10;
    int* p = &a;  // p是a的地址
    std::cout << *p;  // 解引用，输出10

对于迭代器，解引用也是使用 * 操作符，访问迭代器所指向的容器元素：

    std::vector<int> v = {10, 20, 30};
    auto it = v.begin();
    std::cout << *it;  // 解引用，输出10