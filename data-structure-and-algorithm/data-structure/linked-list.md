### 链表基本概念
#### 什么是链表
**链表**（Linked List）是一种常用的数据结构，其特点是由一系列**节点**（Node）构成，每个节点包含数据和指向下一个节点（或前后节点）的引用，与数组相比，**链表中元素的内存地址不一定连续**，而是**通过指针链接在一起**

主要类型有：

* **单链表**（Singly Linked List）：
    * 每个节点只有一个指针，指向下一个节点
* **双链表**（Doubly Linked List）：
    * 每个节点包含两个指针，一个指向前一个节点，一个指向下一个节点，可以在两个方向上遍历
* **循环链表**（Circular Linked List）：
    * 链表的尾节点指向头节点，形成一个闭环

#### 链表的优缺点
##### 优点：

* **动态大小**： 链表可以轻松地在运行时增减元素，内存分配灵活
* **插入和删除操作高效**： 在已知节点位置的情况下，插入和删除操作不需要移动其他元素，时间复杂度通常为 O(1)（不考虑查找时间）

##### 缺点：

* **随机访问困难**： 链表不支持快速随机访问，要访问第 k 个元素需**从头遍历**，时间复杂度为 O(k)
* **额外内存开销**： 每个节点需要存储指针（单链表一个指针，双链表两个指针）
* **缓存局部性较差**： 由于内存可能**不连续**，遍历时 CPU **缓存命中率较低**

### C++ 中链表的实现与使用
在 C++ 中，你可以自己实现链表类，也可以使用标准模板库（STL）中的一些容器（例如 `std::list`）来使用链表

#### 自定义单链表示例
##### 节点定义
每个节点通常包含**数据**和**指向下一个节点的指针**：

    // Node.h
    #ifndef NODE_H
    #define NODE_H

    template<typename T>
    struct Node
    {
        T data;
        Node* next;

        // 构造函数
        Node(const T& value, Node* nextNode = nullptr)
            : data(value), next(nextNode) {}
    };

    #endif // NODE_H

##### 链表类定义
利用节点结构定义一个简单的单链表类，包含插入、删除、遍历等基本操作：

    // LinkedList.h
    #ifndef LINKEDLIST_H
    #define LINKEDLIST_H

    #include "Node.h"
    #include <iostream>

    template<typename T>
    class LinkedList
    {
    private:
        Node<T>* head;  // 头指针

    public:
        // 构造函数和析构函数
        LinkedList() : head(nullptr) {}
        ~LinkedList() { clear(); }

        // 插入一个新节点到链表头部
        void push_front(const T& value)
        {
            head = new Node<T>(value, head);
        }

        // 删除头部节点
        void pop_front()
        {
            if (head)
            {
                Node<T>* temp = head;
                head = head->next;
                delete temp;
            }
        }

        // 清空链表
        void clear()
        {
            while (head)
            {
                pop_front();
            }
        }

        // 打印链表
        void print() const
        {
            Node<T>* current = head;
            while (current)
            {
                std::cout << current->data;
                if (current->next) std::cout << " -> ";
                current = current->next;
            }
            std::cout << std::endl;
        }

        // 返回头节点（只读）
        Node<T>* getHead() const { return head; }
    };

    #endif // LINKEDLIST_H

##### 使用示例
在主函数中使用这个单链表类：

    // main.cpp
    #include "LinkedList.h"
    #include <iostream>

    int main()
    {
        LinkedList<int> list;
        list.push_front(10);
        list.push_front(20);
        list.push_front(30);

        std::cout << "链表内容: ";
        list.print();  // 输出: 30 -> 20 -> 10

        list.pop_front();
        std::cout << "删除头结点后: ";
        list.print();  // 输出: 20 -> 10

        list.clear();
        std::cout << "清空后: ";
        list.print();  // 输出为空

        return 0;
    }

#### 使用 STL 中的 `std::list`
C++ STL 提供了 `std::list` 容器，它就是一个**双向链表**

使用起来非常简单：

    #include <iostream>
    #include <list>

    int main()
    {
        std::list<int> myList;
        
        // 插入数据
        myList.push_back(10);
        myList.push_back(20);
        myList.push_front(5);

        // 遍历链表
        std::cout << "std::list 内容: ";
        for (int x : myList)
        {
            std::cout << x << " ";
        }
        std::cout << std::endl;

        // 删除头部元素
        myList.pop_front();
        
        std::cout << "删除头部元素后: ";
        for (int x : myList)
        {
            std::cout << x << " ";
        }
        std::cout << std::endl;
        
        return 0;
    }

优点是 STL 的实现经过高度优化，支持迭代器、常见算法等，使用时无需自己编写内存管理代码

### Go 语言中的链表实现与使用
在 Go 语言中，链表可以通过**自己定义结构体**（例如实现单链表或双链表），同时 **Go 标准库也提供了一个双向链表容器**，位于 `container/list` 包中

#### 使用 `container/list`
##### 介绍
Go 标准库中的 `container/list` 实现了一个**双向链表**，**支持在两端插入、删除节点，以及任意位置插入和删除操作**

链表中的每个元素类型是 `interface{}`，因此**可以存储任意类型的值**

##### 示例代码

    package main

    import (
        "container/list"
        "fmt"
    )

    func main() {
        // 创建一个新的链表
        l := list.New()

        // 在链表末尾添加元素
        l.PushBack(10)
        l.PushBack(20)
        // 在链表头部添加元素
        l.PushFront(5)

        // 遍历链表
        fmt.Print("链表内容: ")
        for e := l.Front(); e != nil; e = e.Next() {
            fmt.Print(e.Value, " ")
        }
        fmt.Println()

        // 删除头节点（返回被删除的节点）
        head := l.Front()
        if head != nil {
            l.Remove(head)
        }

        fmt.Print("删除头节点后: ")
        for e := l.Front(); e != nil; e = e.Next() {
            fmt.Print(e.Value, " ")
        }
        fmt.Println()
    }

#### 自定义链表实现
有时你可能希望自己实现一个链表来加深理解，下面是一个简单的单链表示例

##### 定义节点结构体

```go
package main

import "fmt"

// 定义一个节点，包含数据和指向下一个节点的指针
type Node struct {
    Value interface{}
    Next  *Node
}

// 链表结构：head 始终指向 dummy，不存业务数据
type SinglyList struct {
    head   *Node  // dummy head
    Length int
}

// 构造函数
func NewSinglyList() *SinglyList {
    return &SinglyList{head: &Node{}}
}
```

##### 核心操作

```go
// 在“头部”插入 —— 统一用 head.Next
func (l *SinglyList) InsertAtHead(v interface{}) {
    n := &Node{Value: v}
    n.Next = l.head.Next
    l.head.Next = n
    l.Length++
}

// 在“尾部”插入 —— 顺序查找到末尾再接入
func (l *SinglyList) InsertAtTail(v interface{}) {
    n := &Node{Value: v}
    cur := l.head
    for cur.Next != nil {
        cur = cur.Next
    }
    cur.Next = n
    l.Length++
}

// 删除指定值 —— 通过 prev.Next 查找并跳过目标节点
func (l *SinglyList) Remove(v interface{}) bool {
    prev := l.head
    for prev.Next != nil && prev.Next.Value != v {
        prev = prev.Next
    }
    if prev.Next == nil {
        return false
    }
    prev.Next = prev.Next.Next
    l.Length--
    return true
}

// 遍历打印
func (l *SinglyList) Traverse() {
    for cur := l.head.Next; cur != nil; cur = cur.Next {
        fmt.Printf("%v → ", cur.Value)
    }
    fmt.Println("nil")
}
```

### 总结与对比
##### 链表概念：
链表是一种动态数据结构，由节点通过指针相连

其插入和删除操作高效，但随机访问较慢

##### C++ 实现：

自定义链表通常涉及定义节点结构体/类以及管理内存的链表类

也可以使用 STL 中的 `std::list`（双向链表）来方便使用，利用迭代器进行遍历和操作

##### Go 实现：

Go 标准库中的 `container/list` 提供了双向链表，适用于大多数场景

也可以自定义单链表或双链表，借助结构体和指针（引用）来完成基本操作，从而加深对数据结构内部机制的理解