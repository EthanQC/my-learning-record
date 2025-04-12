## 对象移动
在很多情况下都会发生对象拷贝，而如果对象拷贝后就立即被销毁了，那这时**移动而非拷贝对象会大幅度提升性能**，为了支持移动操作，不可避免的就是**右值引用**

>左值和右值都是表达式的属性，通常出现在表达式的左侧和右侧
>
>左值：表示**对象的身份**，如变量、函数名
>
>右值：表示**对象的值**，如代数运算表达式、匿名的lambda表达式（临时对象）

右值引用就是**必须绑定到右值的引用**，通过 `&&` 来获得，它只能绑定到一个将要销毁的对象；右值引用允许我们可以将右值作为参数**传递**给函数，比如一个**临时的**lambda表达式

而 `std::move` 则允许我们告诉编译器，我们现在有一个左值，但我们希望像一个右值一样处理它，也就是说通过这个函数，我们可以**把一个左值作为右值使用，并传递给其他函数**，从而实现了对象移动

那么，既然是这样使用的话，我们为什么不直接使用左值引用（即普通的`&`引用）呢？

这就回到了最开始的话题，**我们希望移动对象而非拷贝对象**，如果使用左值引用，我们只能将左值作为常量引用传递，而无法修改或移动它；另外，左值引用也无法传递一个临时对象

在C++11中，引入了右值引用（Rvalue Reference），使用 `&&` 符号表示。右值引用主要用于实现**移动语义**和**完美转发**，以提高性能和资源管理效率。

右值引用允许我们：
* 实现**移动语义**（Move Semantics）： 通过“移动”资源（如动态分配的内存）而不是“复制”，提高性能。
* 实现**完美转发**（Perfect Forwarding）： 在模板中将参数**精确地**传递给另一个函数，无论参数是左值还是右值。

使用右值引用有以下几个好处：
* 性能优化： 避免不必要的拷贝，特别是对于大型对象或拥有动态资源的对象，如 `std::function`。
* 资源管理： 允许函数“获取”传入对象的资源所有权，确保资源高效利用和避免资源泄漏。

例子：

    #include <iostream>
    #include <vector>

    class MyClass
    {
    public:
        int* data;
        
        // 构造函数
        MyClass(int size) : data(new int[size]) //分配一个动态大小的数组给data，并让data指向这个数组的第一个元素
        {
            std::cout << "Constructor: Allocating " << size << " elements" << std::endl;
        }
        
        // 拷贝构造函数
        MyClass(const MyClass& other) : data(new int[10])
        {
            std::cout << "Copy Constructor: Copying data" << std::endl;
            // 这里只是模拟拷贝，实际拷贝的内容根据实际情况会更复杂
            *data = *other.data;
        }

        // 移动构造函数（使用右值引用）
        MyClass(MyClass&& other) noexcept : data(other.data)
        {
            std::cout << "Move Constructor: Moving data" << std::endl;
            other.data = nullptr;  // 使原对象的指针无效，防止析构时释放资源
        }

        // 析构函数
        ~MyClass()
        {
            if (data)
            {
                std::cout << "Destructor: Deleting data" << std::endl;
                delete[] data;
            }
        }

        // 打印数据
        void printData() const
        {
            if (data)
            {
                std::cout << "Data: " << *data << std::endl;
            }
        }
    };

    // 使用右值引用的函数
    void process(MyClass&& obj)
    {
        obj.printData();
    }

    int main()
    {
        MyClass a(10);  // 正常构造对象a
        a.printData();
        
        // 使用右值引用来调用process函数
        process(MyClass(20));  // MyClass(20)是一个右值

        // 移动构造：将a的资源转移到b
        MyClass b(std::move(a));  // 使用std::move将a的资源转移到b
        b.printData();
        // a的数据已经被移动，a.data是nullptr

        return 0;
    }

###### 移动语义
>移动语义（Move Semantics）是C++11引入的一个特性，目的是通过 **“转移资源所有权”而不是进行拷贝**来提高性能。这对于具有昂贵拷贝操作的类型（如std::vector、std::string等）尤其有用。
>
>关键点：
>
>* 右值引用（T&&）是实现移动语义的基础。
>* **移动构造函数和移动赋值运算符**：当对象被转移（而不是拷贝）时，移动构造函数会接管资源，通常将资源的指针从原对象**转移**到新对象，并**将原对象的指针置为nullptr**或类似状态。
>* 移动语义减少了资源的复制，提升了性能，尤其是在容器类型（如std::vector、std::string）和内存管理方面。
>
>例子：

    std::vector<int> a = {1, 2, 3};
    std::vector<int> b = std::move(a);  // 通过移动语义将a的资源转移给b

>这里使用 **`std::move()`** 将a转换为右值，b通过移动构造函数获得a的资源。
>
>移动后，a的内容被“转移”给了b，而a变成了“空”的状态。

***

###### 完美转发
>完美转发（Perfect Forwarding）是指将函数参数**原封不动**地传递给另一个函数，同时保持参数的左值或右值特性。完美转发通常通过 `std::forward` 和右值引用来实现。
>
>为什么需要完美转发：
>
>如果你传递一个左值给函数，那么该函数应该传递左值；如果传递的是右值，函数应该传递右值。如果你错误地转发了左值为右值（或反之），就会丧失优化机会或导致未定义行为。
>
>例子：

    #include <iostream>
    #include <utility>

    void process(int& x) {
        std::cout << "Lvalue processed: " << x << std::endl;
    }

    void process(int&& x) {
        std::cout << "Rvalue processed: " << x << std::endl;
    }

    template<typename T>
    void forwarder(T&& arg) {
        process(std::forward<T>(arg));  // 完美转发
    }

    int main() {
        int x = 5;
        forwarder(x);        // Lvalue processed
        forwarder(10);       // Rvalue processed
    }

>在这个例子中， `forwarder` 函数通过 `std::forward` 来完美转发参数，保证了传递左值时处理左值，传递右值时处理右值。

## lambda表达式简介
**Lambda表达式**是C++11引入的一种非常方便的功能，用于**定义匿名函数对象**（即没有名字的函数）。它允许你在函数体外部直接创建小型函数，尤其适用于短小的函数代码和临时的回调操作。

基本语法：

    [捕获列表](参数列表) -> 返回类型 { 函数体 }

>捕获列表：指定**外部**变量的捕获方式，决定lambda函数内部是否能使用外部变量。
>
>参数列表：与普通函数一样，指定lambda函数的参数。
>
>返回类型：指定lambda的返回类型，如果省略，编译器会自动推导。
>
>函数体：lambda表达式的实现部分。

示例：

    #include <iostream>

    int main() {
        int x = 10;
        
        // 定义一个lambda表达式，捕获x，传入y
        auto square = [x](int y) -> int
        {
            return x + y * y;
        };
        
        std::cout << square(5) << std::endl;  // 输出 35 (10 + 5*5)
        
        return 0;
    }

## Lambda表达式与函数指针
由于lambda表达式创建的是一个匿名的函数对象，而不是一个传统的函数，lambda表达式的类型通常是**无法直接赋给函数指针**的。只有使用 **特定的类型（如[std::function](https://github.com/EthanQC/my-learning-record/blob/main/cpp/hpp/functional.md)）** 时，lambda表达式才能与函数指针进行兼容。

示例（lambda和std::function）：

    #include <iostream>
    #include <functional>  // 包含std::function

    int main()
    {
        // 使用std::function来接受lambda
        std::function<int(int, int)> func = [](int a, int b) { return a + b; };

        std::cout << func(3, 4) << std::endl;  // 输出 7
        
        return 0;
    }

在这个例子中，`std::function` 作为一个通用的函数封装器，可以使lambda表达式像函数指针一样被使用。

## Lambda表达式使用时的注意事项
Lambda表达式是C++11引入的一个非常强大的特性，可以用来定义匿名函数。以下是使用lambda时需要注意的几个要点：

* [ ]：不捕获任何外部变量。
* [x]：按值捕获变量x。
* [&]：按引用捕获所有外部变量。
* [this]：捕获当前对象指针。
* [x, &y]：按值捕获x，按引用捕获y。
* **mutable关键字**：如果lambda需要修改捕获的外部变量，必须加上mutable。


        int x = 10;
        auto lambda = [x]() mutable
        {
            x = 20;  // 修改捕获的变量
            std::cout << x << std::endl;
        };
        lambda();  // 输出 20

* 返回类型：对于没有返回值的lambda，返回类型可以省略。如果有返回值，**显式**指定。

        auto add = [](int a, int b) -> int { return a + b; };