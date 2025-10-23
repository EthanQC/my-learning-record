---
title: list
date: '2025-09-03'
tags:
  - STL
summary: 它实现了**双向链表**（Doubly Linked List）的数据结构
---
### `std::list` 的基本概念
`std::list` 是 C++ 标准模板库（STL）中定义的一个序列容器（Sequence Container）

它实现了**双向链表**（Doubly Linked List）的数据结构

容器中的每一个元素都存储在一个独立的节点中，并且每个节点都包含**指向前一个节点和下一个节点的指针**

这使得 `list` 支持**高效的任意位置的插入和删除操作**，特别是已知位置的插入和删除操作，时间复杂度为 `O(1)`

### 底层结构（数据结构）

    template<typename T>
    struct Node {
        T data;
        Node* prev;
        Node* next;
    };

每个节点（Node）包含：

* 数据本身 `data`

* 前一个节点的指针 `prev`

* 下一个节点的指针 `next`

`std::list` 内部通常还维护一个**哨兵节点**（sentinel node），用来表示头尾（使操作更统一），从而避免处理 `null` 指针带来的边界问题

### 使用方式和常见操作
##### 引入头文件

    # include <list>

##### 创建 `list` 容器

    std::list<int> l1;                  // 默认构造，空 list
    std::list<int> l2(5);               // 包含5个默认初始化的元素（值为0）
    std::list<int> l3(5, 42);           // 包含5个值为42的元素
    std::list<int> l4 = {1, 2, 3, 4};   // 列表初始化
    
### 基本操作
##### 插入元素

    l.push_back(10);     // 尾部插入
    l.push_front(5);     // 头部插入

    auto it = l.begin();
    std::advance(it, 2);
    l.insert(it, 99);    // 在位置 it 前插入

> std::advance 函数是用来将迭代器步进指定长度的，这里就是让 it 指向 begin 后的两个，也就是 2

##### 删除元素

    l.pop_back();        // 删除尾部元素
    l.pop_front();       // 删除头部元素

    auto it = l.begin();
    std::advance(it, 1);
    l.erase(it);         // 删除位置 it 的元素

##### 访问元素

    l.front();           // 获取第一个元素
    l.back();            // 获取最后一个元素

### 遍历方式
##### 使用迭代器

    for (auto it = l.begin(); it != l.end(); ++it) {
        std::cout << *it << " ";
    }

##### 使用范围 for 循环

    for (int x : l) {
        std::cout << x << " ";
    }

### 优缺点分析
##### 优点

* 任意位置插入和删除的时间复杂度为 `O(1)`

* 插入删除元素不会导致其他元素的地址改变

* 双向链表可以正向和反向遍历

##### 缺点

* 不支持随机访问（不支持 `list[i]`）

* 相比 `vector`，占用更多内存（每个节点额外的两个指针）

* 遍历性能比不上连续内存结构（如 `vector`），**缓存局部性差**

* 排序效率比不上数组（尽管提供了 `sort()`）

### 特别说明
`std::list` 是**严格双向链表**，而不是单向链表，C++ 标准库中没有内置的单向链表容器

如果你想要的是单向链表，可以使用 C++11 引入的 `std::forward_list`，它更轻量但功能也更有限（如不能反向遍历）

### 使用示例（完整代码）

    # include <iostream>
    # include <list>

    int main() {
        std::list<int> myList = {1, 2, 3};

        myList.push_front(0);
        myList.push_back(4);

        auto it = myList.begin();
        std::advance(it, 2);
        myList.insert(it, 99);

        for (int val : myList) {
            std::cout << val << " ";
        }
        std::cout << std::endl;

        myList.remove(99);
        myList.reverse();

        for (int val : myList) {
            std::cout << val << " ";
        }
        return 0;
    }

输出：

    0 1 99 2 3 4
    4 3 2 1 0
