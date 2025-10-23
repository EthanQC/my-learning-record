---
title: pair
date: '2025-09-03'
tags:
  - STL
summary: '通常用法为 `std::pair<T1, T2>`，其中 `T1` 和 `T2` 表示两个不同的数据类型'
---
## `pair`
### 基本概念
#### 什么是 `pair`
`pair` 是一个**模板类**，它可以**将两个任意类型的数据组合在一起，使它们形成一个整体**

通常用法为 `std::pair<T1, T2>`，其中 `T1` 和 `T2` 表示两个不同的数据类型

`pair` 常用在需要将两个数据捆绑在一起的场景，比如**表示键值对、坐标点、返回多个结果**等等，它将两个值放在一起，使得它们可以一起传递或存储

#### 为什么需要 `pair`
##### 数据关联：
在编程时，经常会遇到需要把两个紧密相关的数据放在一起的情况

例如，在实现哈希表或关联容器（如 `std::map`、`std::unordered_map`）时，**键和值总是配对出现**，`pair` 这种数据结构就可以很好地解决这个问题

##### 方便返回多个值：
在函数中，当你需要返回两个相关联的结果时，可以用 `pair` 作为返回值，而不必额外定义结构体

##### 代码简洁：
使用 `pair` 能够避免重复定义额外的数据结构，从而使代码更加简洁和直观

### 定义与构造
#### 头文件和命名空间

要使用 `pair`，你需要包含头文件 `<utility>`

`pair` 定义在标准命名空间 `std` 下，使用时通常写为 `std::pair`

#### 构造方法
`pair` 提供多种构造方式，主要包括：

##### 默认构造函数：

    std::pair<int, double> p1;

这会创建一个 `pair` 对象，其中第一个元素和第二个元素会分别调用各自类型的默认构造函数

##### 值初始化构造函数：

    std::pair<int, double> p2(10, 3.14);

这样就直接将第一个元素设为 10，第二个元素设为 3.14

##### 使用 `std::make_pair` 函数：
`std::make_pair` 是一个便利函数，用于**根据提供的值自动推断类型并构造 pair**

    auto p3 = std::make_pair(20, "Hello");

这里 `p3` 的类型将被自动推断为 `std::pair<int, const char*>` 或类似类型

##### 拷贝构造和移动构造：
`pair` 也支持从另一个 `pair` 对象的拷贝或移动构造，这在需要传递或返回 `pair` 时非常方便

#### 成员变量
`pair` 有两个公开成员变量：

* **`first`**： 表示 `pair` 中的**第一个**元素

* **`second`**： 表示 `pair` 中的**第二个**元素

它们可以直接访问和修改，例如：

    std::pair<int, std::string> p(1, "Alice");
    std::cout << p.first << " " << p.second << std::endl; // 输出：1 Alice
    p.first = 2;
    p.second = "Bob";

### 常见操作和用法
#### 比较操作
`pair` **重载了比较运算符**，使得你可以**直接比较**两个 `pair`：

##### 相等比较：
两个 `pair` 相等当且仅当它们的 `first` 和 `second` 都相等

    std::pair<int, int> a(1, 2);
    std::pair<int, int> b(1, 2);
    if(a == b) { /* 相等 */ }

##### 大小比较：
比较时**先比较 `first`**，如果 `first` 相等，再比较 `second`

这就使得 `pair` 能用于排序和作为关联容器的**键**

#### 应用示例
##### 作为函数返回值：
当函数需要返回两个关联的数据时，可以用 `pair` 作为返回值：

    std::pair<int, int> getMinMax(const std::vector<int>& nums)
    {
        int minVal = nums[0];
        int maxVal = nums[0];

        for (int x : nums)
        {
            if (x < minVal) minVal = x;
            if (x > maxVal) maxVal = x;
        }

        return std::make_pair(minVal, maxVal);
    }

调用时可以使用：

    auto result = getMinMax({3, 7, 2, 9});
    std::cout << "最小值: " << result.first << ", 最大值: " << result.second << std::endl;

##### 在 STL 容器中使用 `pair`：
`std::map` 和 `std::unordered_map` 内部就使用了 `pair` 来存储键值对

例如：

    std::map<std::string, int> ages;
    ages.insert(std::make_pair("Alice", 30));
    ages["Bob"] = 25;
    
这种场景下，`pair` 存储了 “名字-年龄” 这样的关联关系

##### 与结构化绑定（C++17）搭配使用：
C++17 引入了结构化绑定，你可以非常方便地解构 `pair`：

    auto [minVal, maxVal] = getMinMax({3, 7, 2, 9});
    std::cout << "Min: " << minVal << ", Max: " << maxVal << std::endl;

这里的 `getMinMax` 函数是上面的示例中的一个函数，这里是表示通过结构化绑定，可以不用再用 `first` 和 `second` 这两个成员来访问元素，而是直接解构

### 进阶应用
#### 嵌套的 `pair`
你可以将 `pair` 嵌套在一起，用于存储更复杂的数据结构：

    std::pair<int, std::pair<std::string, double>> info;
    info.first = 1;
    info.second.first = "Product";
    info.second.second = 99.99;

这种嵌套结构在需要表达多层次数据时比较有用，虽然可读性不如自定义结构体，但有时可以减少额外类型定义

#### 与其他数据结构的结合
##### 与 `vector`：
常常会用 `vector<pair<T1, T2>>` 来保存一系列的关联数据，比如表示`点的集合、边信息`等

    std::vector<std::pair<int, int>> edges;
    edges.push_back(std::make_pair(1, 2));
    edges.push_back({2, 3});  // C++11 的初始化语法

##### 与算法：
可以利用 `pair` 的**比较运算符**直接对含有 `pair` 的容器进行**排序**

例如，排序一组 (键, 值) 对，默认会**先按键排序，再按值排序**

### 优点与局限性
#### 优点
##### 简单高效：
`pair` 直接嵌入了两个数据，不需要额外的方法就能很方便地存储和访问数据

##### 通用性：
适用于保存任何两个相关联的数据，类型无须相同，可以是任意数据类型

##### STL 支持：
在 C++ 标准库中有广泛应用，很多标准容器和算法都依赖 `pair`

#### 局限性
##### 数据量固定：
`pair` 只能容纳两个数据，如果需要存储更多数据，可能需要使用 `tuple`（元组）或者自定义结构体

##### 语义表达力有限：
`pair` 只有两个成员，命名为 `first` 和 `second`，语义上较为抽象

如果两个元素的含义不够明确，代码可读性可能降低，此时自定义结构体并给成员起有意义的名字可能更好

### 总结
`pair` 是 C++ 中一种简单却功能强大的数据结构，用于将两个关联的数据捆绑在一起

它：

* 定义在 `<utility>` 头文件中

* 可以通过 `std::make_pair` 等方便函数构造

* 具有直观的成员变量 `first` 与 `second` 来存储各自的数据

* 广泛应用于 STL 容器、函数返回值、排序、解构等场景
