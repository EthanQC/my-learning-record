### vector 的基本概念
vector 是 C++ 标准库中的一个**动态数组容器**，属于 **`std::vector`** 类模板

与传统的数组不同，vector 的大小可以**动态调整**，能够根据需要自动扩展或缩小

##### 主要特点：
* **动态大小**：vector 会根据需要**自动调整大小**，无需手动管理内存
* **存储连续内存**：像数组一样，vector 中的元素是存储在**连续**的内存区域中的，可以**通过下标直接访问元素**。
* **支持随机访问**：vector 支持高效的随机访问（通过下标访问）
* **支持插入和删除操作**：vector 支持在**尾部**添加元素，但在**中间**插入或删除元素的效率**较低**

***

###### 随机访问
>
> **随机访问**（Random Access）是指可以通过下标**直接访问** vector 中的任何元素
>
> vector 在内存中是以**连续**的块存储数据的，这使得我们能够通过下标（如v[i]）在常数时间内访问任意元素（即O(1)时间复杂度），这种特性**是 vector 相比链表等数据结构的一个重要优势**
>
>例如：
>
    std::vector<int> v = {10, 20, 30};
    std::cout << v[1];  // 输出20
>
>这里的v[1]是一个随机访问操作，能直接获取到索引位置1的元素

***

### vector 的常用操作
##### 定义和初始化

    #include <vector>

    std::vector<int> v1;  // 创建一个空的vector，类型为int
    std::vector<int> v2(5, 10);  // 创建一个包含5个元素，每个元素的值为10的vector
    std::vector<int> v3{1, 2, 3, 4, 5};  // 使用列表初始化

##### 提前分配内存
`reserve` 函数用于为 `std::vector` **提前分配**足够的存储空间，**防止动态扩容时多次分配内存**，从而提高性能

* 功能：
    * 修改 vector 的容量
    * 不会改变当前已存储的元素数量
* 使用场景
    * 在预先知道将会插入大量元素的情况下，可以使用 `reserve` **提前分配**所需的内存，避免插入时多次重新分配内存，提高程序性能

示例代码：

    #include <iostream>
    #include <vector>

    int main()
    {
        std::vector<int> vec;

        std::cout << "Initial capacity: " << vec.capacity() << std::endl;

        vec.reserve(10);  // 预先分配容量为10
        std::cout << "Capacity after reserve: " << vec.capacity() << std::endl;

        vec.push_back(1);
        std::cout << "Size: " << vec.size() << ", Capacity: " << vec.capacity() << std::endl;

        return 0;
    }

输出：

    Initial capacity: 0
    Capacity after reserve: 10
    Size: 1, Capacity: 10

注意事项:
* 如果**小于当前 `capacity()`**，`reserve` 不会减少容量
* 如果**小于当前的元素个数 `size()`**，`reserve` 不会影响现有的元素

##### 访问元素
使用下标运算符 **`[]`** 或 `at()` 方法来访问元素：

    int x = v3[2];  // 使用下标访问元素，返回值为3
    int y = v3.at(2);  // 使用at()方法访问元素，返回值为3

 `at()` 方法具有**边界检查**，而 **`[]`** 没有。

 ***

###### 边界检查
>
>**边界检查**（Bounds Checking）是指在访问容器中的元素时，程序会检查**是否访问了容器的有效范围**，这样可以**避免访问越界**，防止程序出错
>
> **`[]`** 运算符不进行边界检查，如果你访问了一个无效的索引（例如超过vector的大小），程序不会报错，而是可能会返回未定义的行为（例如访问无效内存）
>
> **`at()`** 方法会进行边界检查，如果索引超出了范围，它会抛出一个 **`std::out_of_range`** 异常
>
>例如：
>

    std::vector<int> v = {1, 2, 3};
    std::cout << v[3];  // 可能会导致错误（索引下标从0开始）
    std::cout << v.at(3);  // 会抛出异常 std::out_of_range

***

##### 添加元素
使用 **`push_back()`** 方法在 vector 的**尾部**添加元素：

    v1.push_back(10);  // 在尾部添加元素10
    v1.push_back(20);  // 在尾部添加元素20

##### 删除元素
使用 **`pop_back()`** 方法删除 vector **尾部**的元素：

    v1.pop_back();  // 删除尾部的元素

使用 **`erase()`** 方法删除**指定位置**的元素：

    v3.erase(v3.begin() + 2);  // 删除下标为2的元素

***

##### `emplace_back()`
`emplace_back` 是 C++11 引入的一个函数，用于在 vector 的**尾部**直接构造对象

与 `push_back` 相比，`emplace_back` 可以**避免不必要的临时对象创建和拷贝操作**，提高性能

* 参数：接受对象的构造函数参数
* 功能：
    * 使用传入的参数在容器尾部直接构造对象
    * 避免了临时对象的创建和复制，提升性能

**与 `push_back` 的区别**

`push_back`：需要一个**完整**的对象作为参数，可能会导致拷贝或移动
`emplace_back`：**直接在容器尾部构造对象**，传入的参数用于调用对象的构造函数

示例代码1：`push_back`

    #include <iostream>
    #include <vector>
    #include <string>

    class MyClass
    {
    public:
        MyClass(int a, const std::string& b) : x(a), y(b)
        {
            std::cout << "Constructor called: " << x << ", " << y << std::endl;
        }

    private:
        int x;
        std::string y;
    };

    int main() {
        std::vector<MyClass> vec;
        MyClass obj(1, "Hello");

        vec.push_back(obj);  // 插入左值，拷贝构造，无法直接构造
        vec.push_back(MyClass(2, "World"));  // 插入右值，移动构造，需要使用匿名对象才能构造

        return 0;
    }

示例代码2：`emplace_back`

    #include <iostream>
    #include <vector>
    #include <string>

    class MyClass
    {
    public:
        MyClass(int a, const std::string& b) : x(a), y(b)
        {
            std::cout << "Constructor called: " << x << ", " << y << std::endl;
        }

    private:
        int x;
        std::string y;
    };

    int main()
    {
        std::vector<MyClass> vec;

        vec.emplace_back(1, "Hello");  // 直接在容器尾部构造对象
        vec.emplace_back(2, "World");

        return 0;
    }

注意事项：

* 如果构造的对象需要**多参数**，则 `emplace_back` 的效率会更高，因为它避免了额外的临时对象
* 对于简单类型（如 int 或 double），`emplace_back` 和 `push_back` 的性能基本相同

***

>###### begin()：
>
> **`begin()`** 是一个成员函数，返回指向vector**第一个元素**的迭代器
>
> 迭代器是C++ STL容器的一种通用方式，用于遍历容器中的元素
>
>例如：

    std::vector<int> v = {10, 20, 30};
    auto it = v.begin();  // it指向v的第一个元素
    std::cout << *it;  // 输出10

> **`begin()`** 返回的迭代器指向vector的第一个元素，你可以通过**解引用**（*it）来访问它

***

###### 迭代器
>
>迭代器是一种用于**访问容器元素**的工具。可以将其看作是**指向容器中元素的指针**。迭代器可以遍历容器的**所有**元素
>
>迭代器支持以下操作：
>
> **`begin()`** ：返回指向容器第一个元素的迭代器。
> **`end()`** ：返回指向容器**最后一个**元素**后一个位置**的迭代器，**`end()`** 的返回值并不指向有效元素，而是指向一个“哨兵”位置，这个位置表示容器的末尾
>
>例如：

    std::vector<int> v = {10, 20, 30};
    auto it = v.begin();  // it指向第一个元素
    std::cout << *it;  // 输出10
    it++;  // 移动到下一个元素
    std::cout << *it;  // 输出20

>迭代器允许你**像指针一样操作容器中的元素**，但它可以抽象不同类型的容器
>
>你可以使用 **`begin()`** 和 **`end()`** 来遍历vector中的所有元素：

    std::vector<int> v = {10, 20, 30};
    auto it = v.begin();
    auto end = v.end();
    while (it != end)
    {
        std::cout << *it << " ";  // 输出10 20 30
        ++it;  // 移动到下一个元素
    }

>这里的 **`it != v.end()`** 用于判断是否已经遍历到容器的末尾

***

>###### auto：
>
> **auto** 是C++11引入的关键字，允许编译器**自动推导变量的类型**。使用auto时，编译器根据变量的初始化值来确定变量的类型，这使得代码更加简洁，尤其是在处理复杂类型（如迭代器）时
>
>例如：

    int a = 10;
    auto b = a;  // b的类型会被推导为int
    std::cout << b;  // 输出10

>对于迭代器：

    std::vector<int> v = {10, 20, 30};
    auto it = v.begin();  // it的类型会被推导为std::vector<int>::iterator
    std::cout << *it;  // 输出10

> **auto** 让代码更加简洁，避免了显式地指定复杂的类型，尤其是在需要与STL容器和迭代器一起使用时非常有用

***

##### 获取容器的大小和容量
使用 **`size()`** 方法获取当前元素个数，使用 **`capacity()`** 获取容器的容量：

    std::cout << "Size: " << v3.size() << std::endl;  // 返回元素个数
    std::cout << "Capacity: " << v3.capacity() << std::endl;  // 返回容器的容量

>**size()**：返回当前容器中元素的个数
>**capacity()**：返回容器分配的内存大小，即它能够容纳的元素数量

##### 清空容器
使用 **`clear()`** 方法清空 vector 中的**所有**元素：

    v3.clear();  // 清空所有元素

##### 遍历 vector
使用范围**基于 for 循环**或**迭代器**遍历vector中的元素：

    // 基于for循环
    for (int num : v3)
    {
        std::cout << num << " ";
    }

    // 或者使用迭代器
    for (auto it = v3.begin(); it != v3.end(); ++it)
    {
        std::cout << *it << " ";
    }

***

>###### for (int num : v3)：
>
>这种写法叫做**范围基于的for循环**（range-based for loop），它是 C++11 引入的，简化了遍历容器的代码
>
>v3 是一个容器（如vector），num 是容器中的每个元素，for 循环会**自动遍历 v3 中的每个元素**，并将每个元素赋值给 num，然后执行循环体
>
>例如：

    std::vector<int> v = {10, 20, 30};

    for (int num : v)
    {
        std::cout << num << " ";  // 输出：10 20 30
    }

>这种写法比传统的 for 循环**更简洁**，不需要使用下标
>
>适用条件：
> * 容器必须至少提供 **begin()** 和 **end()** 成员函数，或者支持 **begin()** 和 **end()** 迭代器（也就是基本上所有容器都可以这样写）
> * 数组（传统的 C-style 数组）也可以使用范围基于的 for 循环
>
>但是，范围基于的 for 循环有几个限制：
>
> * 无法**直接访问**容器的索引，如果需要索引，你可以使用传统的for循环或在循环内部维护一个额外的索引
> * **不能修改容器的结构（例如删除元素）**，如果要在遍历时修改容器，可能需要用迭代器来实现

***

### 性能和注意事项
* **动态扩展**：当 vector 的容量不足以容纳新元素时，它会**自动扩展**，并且通常会以**2的倍数**增长容量

* **插入和删除的性能**：在 vector 的末尾插入元素是 O(1) 操作，而在中间或前面插入元素则需要**移动元素**，因此是 **O(n)** 操作

### vector 的常用算法
C++ 提供了很多 STL 算法，可以和 vector 结合使用

比如：

* **`std::sort(v.begin(), v.end())`**：对vector中的元素进行排序
* **`std::reverse(v.begin(), v.end())`**：反转vector中的元素

### 示例代码

    #include <iostream>
    #include <vector>
    #include <algorithm>  // std::sort, std::reverse

    int main()
    {
        std::vector<int> v = {1, 4, 5, 2, 3};
        
        // 添加元素
        v.push_back(6);
        
        // 删除元素
        v.pop_back();
        
        // 排序
        std::sort(v.begin(), v.end());
        
        // 反转
        std::reverse(v.begin(), v.end());
        
        // 遍历
        for (int num : v)
        {
            std::cout << num << " ";
        }
        return 0;
    }

### 总结
 **`vector`** 是一个非常常用的动态数组容器，适合大多数需要**动态增长**、支持**快速访问**的场景

它提供了方便的操作，如添加、删除、访问元素等，使用时需要注意性能上的差异，特别是插入和删除操作