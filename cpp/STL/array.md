## **`std::array`** 简介
 **`std::array`** 是C++11引入的一个容器类型，它是一个固定大小的数组容器，与传统的C风格数组相比， **`std::array`** 提供了更多的功能，并且它是C++标准库的一部分

#### 特点：
* 固定大小：**`std::array`** 的大小在编译时确定，一旦定义大小就不能更改
* 数组包装：它在内部封装了一个C风格的数组，因此它的内存布局与普通数组相同，但是提供了更多的成员函数来操作数据
* 类型安全： **`std::array`** 提供了类型安全，支持[边界检查](https://github.com/EthanQC/my-learning-record/blob/main/cpp/STL/vector.md#边界检查)等操作
* 可以与STL算法兼容： **`std::array`** 支持C++标准库中的许多算法，像 **`std::sort()`**、 **`std::reverse()`** 等

## **`std::array`** 常用操作：
* **`size()`** ：返回数组的元素个数。
* **`at()`** ：提供边界检查，返回指定位置的元素。
* **`operator[]`** ：类似于C风格数组的下标操作符，但不进行边界检查。
* **`fill()`** ：用一个特定的值填充整个数组。
* **`begin()`** 和 **`end()`** ：返回指向数组首元素和末尾元素后一个位置的迭代器。

示例：

    #include <iostream>
    #include <array>

    int main()
    {
        std::array<int, 5> arr = {1, 2, 3, 4, 5};
        
        // 遍历std::array
        for (auto num : arr)
        {
            std::cout << num << " ";  // 输出：1 2 3 4 5
        }
        std::cout << std::endl;

        // 使用at()进行边界检查
        std::cout << arr.at(2) << std::endl;  // 输出3
        
        // 使用fill()填充
        arr.fill(10);
        for (auto num : arr)
        {
            std::cout << num << " ";  // 输出：10 10 10 10 10
        }
        std::cout << std::endl;

        // 使用std::array的size()方法
        std::cout << "Size: " << arr.size() << std::endl;  // 输出Size: 5
    }

 **`std::array`** 与C风格数组的区别：
* 类型安全： **`std::array`** 提供了更多的功能，例如边界检查，而C风格数组没有。
* 支持STL算法： **`std::array`** 可以直接与STL算法一起使用，C风格数组不能。
* 可变类型和大小： **`std::array`** 的大小在编译时确定，而C风格数组也类似，但 **`std::array`** 能提供更多的成员函数。