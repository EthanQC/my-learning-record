## `<memory>` 智能指针

#### 什么是智能指针
智能指针（Smart Pointer）是对普通指针的一种包装，它能够在一定程度上**自动管理所指对象的生命周期**，避免显式 `delete` 带来的麻烦或潜在的内存泄漏、悬空指针等问题

智能指针是封装了原始指针的类，提供了自动内存管理的机制，它们通过 **RAII**（资源获取即初始化）原则，确保资源在不再需要时自动释放，从而避免手动管理内存的复杂性和错误

C++ 的智能指针是标准库的一部分，特别适合处理动态分配的对象，减少了内存管理相关的 bug

C++11 引入了标准库中的一系列智能指针：`std::unique_ptr`、`std::shared_ptr` 和 `std::weak_ptr`（另外还有 `std::auto_ptr`，但已被废弃，不建议使用）

在 C++17、C++20 标准中也对这些智能指针进行了进一步的补充和强化

#### 常见智能指针及其头文件
`std::unique_ptr`、`std::shared_ptr` 和 `std::weak_ptr` 均包含在 `<memory>` 这个标准库中

**`std::unique_ptr`**
特点：**独占式所有权**，不能被复制，但可以移动

适合表现“对象唯一所有者”的场景

**`std::shared_ptr`**
特点：**共享式所有权**，通过引用计数（Reference Counting）来管理同一对象的多个拥有者

在所有 `std::shared_ptr` 都销毁后，对象才会被释放

**`std::weak_ptr`**
特点：**弱引用**，不会影响引用计数，必须与 `std::shared_ptr` 搭配使用

它不会延长对象的生命周期，但可以安全地观测对象是否还存在

注意：在非常早期的 C++ 中曾有 `std::auto_ptr`（头文件 <memory>），它也是某种“智能指针”，但是它的复制语义存在很多问题，从 C++11 开始就被废弃了，不再建议使用

#### `std::unique_ptr` 的使用
`std::unique_ptr` 拥有对象的唯一所有权，不可复制，但可以移动（move）

举例如下：

    #include <iostream>
    #include <memory>   // 包含智能指针相关定义

    int main()
    {
        // 使用 std::unique_ptr 管理一个动态分配的 int
        std::unique_ptr<int> uptr1(new int(10));

        // C++14 开始建议用 std::make_unique 创建：
        auto uptr2 = std::make_unique<int>(20);

        // 不可复制，会编译报错：
        // std::unique_ptr<int> uptr3 = uptr1; // error

        // 但是可以移动
        std::unique_ptr<int> uptr4 = std::move(uptr1); 
        // 此时 uptr1 变为空，uptr4 拥有之前 uptr1 所拥有的资源

        // 访问指针内容
        std::cout << "uptr4's value: " << *uptr4 << std::endl;

        return 0;
    }

使用注意事项：

* `std::unique_ptr` 不可拷贝，若需将其作为函数返回值、参数或成员变量，需要考虑[移动语义](https://github.com/EthanQC/my-learning-record/blob/main/cpp/copy-and-move-objects/lambda.md#移动语义)（可以返回 `std::unique_ptr`，也可以形参或成员变量直接持有它；如果希望转移所有权，可使用 std::move）
* 如果你真的需要多个共享所有者，可以考虑使用 std::shared_ptr；若只需要唯一所有权则优先考虑 std::unique_ptr
* 不要手动 delete，智能指针会在被销毁时自动释放资源

#### `std::shared_ptr` 的使用
`std::shared_ptr` 使用**引用计数**来共享对象的所有权；当最后一个引用被销毁时，被管理的对象才会被释放

示例如下：

    #include <iostream>
    #include <memory>

    int main()
    {
        // 通过 make_shared 创建共享指针（推荐用法）
        std::shared_ptr<int> sptr1 = std::make_shared<int>(10);

        // 拷贝构造或赋值可使引用计数+1
        std::shared_ptr<int> sptr2(sptr1);

        // 查看引用计数
        std::cout << "Reference count: " << sptr1.use_count() << std::endl;  // 2

        // 访问指针的值
        std::cout << "Value: " << *sptr1 << std::endl;  // 10

        // 销毁一个 sptr，不会立即销毁对象，只是计数减一
        sptr2.reset();
        std::cout << "Reference count after reset: " << sptr1.use_count() << std::endl; // 1

        return 0;
    }

使用注意事项：

* 避免**循环引用**（circular reference）：
    * 如果两个对象**互相持有** `std::shared_ptr` 会导致引用计数无法归零，从而造成内存泄漏
    * 此时应将其中至少一方的 `std::shared_ptr` 改为 `std::weak_ptr`
* 创建方式通常推荐使用 **`std::make_shared<T>()`**，因为它更安全并且会进行单次内存分配（而 `new + std::shared_ptr` 的写法实际上可能分配两块内存，一块是对象，一块是控制块）。
* `std::shared_ptr` 可以被拷贝，也可以被移动；拷贝之后引用计数会增加，移动后原指针被置空。

#### `std::weak_ptr` 的使用
`std::weak_ptr` 不会增加引用计数，它主要用来**观测**由 `std::shared_ptr` 管理的对象是否还“活着”

因为它不影响对象的生命周期，所以可以在避免循环引用的场景中发挥重要作用。


    #include <iostream>
    #include <memory>

    int main()
    {
        // 创建一个 std::shared_ptr
        std::shared_ptr<int> sptr = std::make_shared<int>(100);

        // 创建一个 std::weak_ptr 观察 sptr
        std::weak_ptr<int> wptr(sptr);

        // lock() 会返回一个 std::shared_ptr<int>
        // 如果原对象已经被销毁，返回的共享指针将是空的
        if (auto temp = wptr.lock())
        {
            std::cout << "Value: " << *temp << std::endl;   // 100
            std::cout << "use_count: " << temp.use_count() << std::endl;
        }
        else
        {
            std::cout << "Object is already destroyed." << std::endl;
        }

        // reset sptr
        sptr.reset(); // sptr 被销毁，资源被释放

        // 再次尝试 lock
        if (auto temp = wptr.lock())
        {
            std::cout << "Value: " << *temp << std::endl;
        }
        else
        {
            std::cout << "Object is already destroyed." << std::endl;
        }

        return 0;
    }

使用注意事项：

* `std::weak_ptr` 必须从 `std::shared_ptr` 构造或赋值而来，不能直接指向一个原始指针
* 由于 `std::weak_ptr` 不增加引用计数，因此**只有在 `lock()` 后才能安全地访问资源**
* 常见用途：避免 `std::shared_ptr` 之间的循环引用（如双向链表、树状结构的父子节点互相引用等）

#### 常见的错误与注意事项

* 不匹配的 `delete`：
    * 一般不要通过 `get()` 获得普通指针并手动 `delete`，这样会破坏智能指针的内部机制
    * 除非十分特殊的场景，否则都应当交由智能指针自己管理对象的释放
* 自定义删除器（Deleter）：
    * 在某些场景（如处理文件句柄、网络连接等资源）中，可以为智能指针传入自定义删除器，以在销毁时执行特定的清理逻辑

比如：

    std::shared_ptr<FILE> filePtr(std::fopen("test.txt", "r"), [](FILE* fp){
        if (fp) std::fclose(fp);
    });

* 跨 DLL/共享库边界：
    * 在某些操作系统和编译环境中，跨 DLL 或共享库边界传递  `std::shared_ptr` 需要格外小心，必须保证使用相同的 C++ 运行时库，并且保证对象与其控制块在相同的内存堆中
    * 如果库边界不兼容，可能会出现内存管理的问题

#### 性能和内存方面的考虑
* `std::unique_ptr`
    * 无需引用计数，开销最小，与普通指针几乎无差别
* `std::shared_ptr`
    * 额外保存引用计数、控制块等信息，增加了内存和 CPU 负担
    * 对象分配通常建议用 `std::make_shared` 一次性分配，**对象和控制块通常被连续分配在一起**，这样性能和缓存命中更好
* `std::weak_ptr`
    * 本身并不增加引用计数，但需要与 `std::shared_ptr` 关联，有相应的控制块元数据
    * 多次 `lock()` 会有一定的管理开销

#### 小结
* 头文件
    * 所有标准智能指针都位于头文件 `<memory>` 中，包含 `#include <memory>` 即可使用
* 使用方法
    * 优先使用工厂函数 `std::make_shared<T>()` 或 `std::make_unique<T>()` 创建智能指针
    * 对于需要“唯一所有权”资源，使用 `std::unique_ptr`
    * 对于“共享所有权”，使用 `std::shared_ptr`
    * 需要“观测”但不想延长对象生命周期时，使用 `std::weak_ptr`
    * 使用移动语义转移所有权，避免在不必要时使用复制拷贝
* 注意事项
    * 不要产生循环引用，如有需要可引入 `std::weak_ptr`
    * 不要手动 `delete` 由智能指针管理的资源，也不要通过 `get()` 后对原生指针进行不正确的操作
    * 注意跨模块或库边界的兼容性
    * 使用自定义删除器处理非常规资源时，确保删除器的正确性