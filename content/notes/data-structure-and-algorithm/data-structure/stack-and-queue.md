---
title: stack and queue
date: '2025-09-03'
tags:
  - data-structure
summary: >-
  int main() { std::stack<int> st; // 底层默认是 deque<int> st.push(10); // 压入元素
  st.push(20); std::cout << "栈顶元素: " << st.top() << "\n"; // 20 st.pop(); // 弹出
  20 std::cout << "弹出后栈顶: " <<
---
## 栈（Stack）
#### 什么是栈？

* 逻辑模型：一种**后进先出**（LIFO，Last In First Out）的线性结构

* 核心操作：

  * `Push`：将元素压入栈顶

  * `Pop`：将栈顶元素弹出

  * `Top` / `Peek`：访问栈顶元素但不删除

  * `Empty`：判断栈是否为空

  * `Size`：获取当前栈中元素个数

#### 应用场景

* 函数调用栈（保存局部变量、返回地址）

* 表达式求值（中缀转后缀、算术运算）

* 括号匹配（编译原理）

* 深度优先搜索（DFS）

#### C++ 中的栈
##### STL 实现：`std::stack`
```cpp
# include <iostream>
# include <stack>

int main()
{
    std::stack<int> st;            // 底层默认是 deque<int>
    st.push(10);                   // 压入元素
    st.push(20);
    std::cout << "栈顶元素: " << st.top() << "\n";  // 20
    st.pop();                      // 弹出 20
    std::cout << "弹出后栈顶: " << st.top() << "\n"; // 10
    std::cout << "当前大小: " << st.size() << "\n"; // 1
    std::cout << "是否为空: " << std::boolalpha << st.empty() << "\n"; // false
    return 0;
}
```

优点：调用方便，功能齐全，底层容器可自定义（`deque`、`vector`、`list`）

缺点：无法随机访问中间元素，只能操作栈顶

##### 自定义实现
基于动态数组（`vector`）

```cpp
template<typename T>
class ArrayStack
{
private:
    std::vector<T> data;
public:
    void push(const T& x) { data.push_back(x); }
    void pop() { if (!data.empty()) data.pop_back(); }
    T& top() { return data.back(); }
    bool empty() const { return data.empty(); }
    size_t size() const { return data.size(); }
};
```

基于链表

```cpp
template<typename T>
struct Node {
    T val;
    Node* next;
    Node(const T& v, Node* n = nullptr) : val(v), next(n) {}
};

template<typename T>
class LinkedStack {
private:
    Node<T>* head = nullptr;
    size_t cnt = 0;
public:
    void push(const T& x) {
        head = new Node<T>(x, head);
        ++cnt;
    }
    void pop() {
        if (!head) return;
        Node<T>* tmp = head;
        head = head->next;
        delete tmp;
        --cnt;
    }
    T& top() { return head->val; }
    bool empty() const { return head == nullptr; }
    size_t size() const { return cnt; }
    ~LinkedStack() {
        while (head) pop();
    }
};
```

#### Go 中的栈
Go 标准库没有专门的 `stack` 类型，但我们可以基于 `slice` 或 `container/list`（go 标准库提供的双向链表）来实现

##### 基于 `slice`
```go
package main

import "fmt"

type Stack[T any] struct {
    data []T
}

func (s *Stack[T]) Push(v T) {
    s.data = append(s.data, v)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.data) == 0 {
        var zero T

        return zero, false
    }

    idx := len(s.data) - 1
    v := s.data[idx]

    s.data = s.data[:idx]

    return v, true
}

func (s *Stack[T]) Top() (T, bool) {
    if len(s.data) == 0 {
        var zero T

        return zero, false
    }

    return s.data[len(s.data)-1], true
}

func (s *Stack[T]) Empty() bool {
    return len(s.data) == 0
}

func (s *Stack[T]) Size() int {
    return len(s.data)
}

func main() {
    st := Stack[int]{}
    st.Push(100)
    st.Push(200)

    if top, ok := st.Top(); ok {
        fmt.Println("栈顶:", top) // 200
    }

    if val, ok := st.Pop(); ok {
        fmt.Println("弹出:", val) // 200
    }

    fmt.Println("当前大小:", st.Size())
}
```

##### 基于 `container/list`
```go
package main

import (
    "container/list"
    "fmt"
)

type StackList[T any] struct {
    l *list.List
}

func NewStackList[T any]() *StackList[T] {
    return &StackList[T]{l: list.New()}
}

func (s *StackList[T]) Push(v T) {
    s.l.PushBack(v)
}

func (s *StackList[T]) Pop() (T, bool) {
    e := s.l.Back()

    if e == nil {
        var zero T

        return zero, false
    }

    s.l.Remove(e)

    return e.Value.(T), true
}

func (s *StackList[T]) Top() (T, bool) {
    e := s.l.Back()

    if e == nil {
        var zero T

        return zero, false
    }

    return e.Value.(T), true
}

func (s *StackList[T]) Empty() bool {
    return s.l.Len() == 0
}

func (s *StackList[T]) Size() int {
    return s.l.Len()
}

func main() {
    st := NewStackList[int]()
    st.Push(1)
    st.Push(2)

    if v, ok := st.Pop(); ok {
        fmt.Println("Pop:", v)
    }

    fmt.Println("Size:", st.Size())
}
```

## 队列（Queue）
#### 什么是队列？

* 逻辑模型：一种**先进先出**（FIFO，First In First Out）的线性结构

* 核心操作：

  * `Enqueue`（入队）：在队尾插入元素

  * `Dequeue`（出队）：从队头移除元素

  * `Front` / `Peek`：访问队头元素

  * `Empty`：判断队列是否为空

  * `Size`：获取元素个数

#### 应用场景

* 广度优先搜索（BFS）

* 任务调度

* 缓冲区（如生产者–消费者模型）

* 消息队列

#### C++ 中的队列
##### STL 实现：`std::queue`
```cpp
# include <iostream>
# include <queue>

int main()
{
    std::queue<std::string> q;  // 底层同样默认 deque
    q.push("A");
    q.push("B");
    std::cout << "队头: " << q.front() << "\n";  // A
    q.pop();
    std::cout << "出队后队头: " << q.front() << "\n"; // B
    std::cout << "大小: " << q.size() << "\n";       // 1
    std::cout << "是否为空: " << std::boolalpha << q.empty() << "\n"; // false
    return 0;
}
```

##### 自定义实现
基于循环数组

```cpp
template<typename T>
class CircularQueue {
private:
    std::vector<T> buf;
    size_t head = 0, tail = 0, cnt = 0;
public:
    CircularQueue(size_t capacity) : buf(capacity) {}
    bool enqueue(const T& x) {
        if (cnt == buf.size()) return false; 
        buf[tail] = x;
        tail = (tail + 1) % buf.size();
        ++cnt;
        return true;
    }
    bool dequeue() {
        if (cnt == 0) return false;
        head = (head + 1) % buf.size();
        --cnt;
        return true;
    }
    T& front() { return buf[head]; }
    bool empty() const { return cnt == 0; }
    size_t size() const { return cnt; }
};
```

基于链表

```cpp
template<typename T>
struct QNode {
    T val; QNode* next;
    QNode(const T& v) : val(v), next(nullptr) {}
};

template<typename T>
class LinkedQueue {
private:
    QNode<T>* head = nullptr;
    QNode<T>* tail = nullptr;
    size_t cnt = 0;
public:
    void enqueue(const T& x) {
        auto node = new QNode<T>(x);
        if (!tail) head = node;
        else tail->next = node;
        tail = node;
        ++cnt;
    }
    void dequeue() {
        if (!head) return;
        auto tmp = head;
        head = head->next;
        if (!head) tail = nullptr;
        delete tmp;
        --cnt;
    }
    T& front() { return head->val; }
    bool empty() const { return cnt == 0; }
    size_t size() const { return cnt; }
    ~LinkedQueue() { while (head) dequeue(); }
};
```

#### Go 中的队列
同样可以用 `slice` 或 `container/list` 来实现

##### 基于 `slice`
```go
package main

import "fmt"

type Queue[T any] struct {
    data []T
}

func (q *Queue[T]) Enqueue(v T) {
    q.data = append(q.data, v)
}

func (q *Queue[T]) Dequeue() (T, bool) {
    if len(q.data) == 0 {
        var zero T

        return zero, false
    }

    v := q.data[0]
    q.data = q.data[1:]

    return v, true
}

func (q *Queue[T]) Front() (T, bool) {
    if len(q.data) == 0 {
        var zero T

        return zero, false
    }

    return q.data[0], true
}

func (q *Queue[T]) Empty() bool {
    return len(q.data) == 0
}

func (q *Queue[T]) Size() int {
    return len(q.data)
}

func main() {
    q := Queue[string]{}
    q.Enqueue("task1")
    q.Enqueue("task2")

    if front, ok := q.Front(); ok {
        fmt.Println("队头:", front) // task1
    }

    if v, ok := q.Dequeue(); ok {
        fmt.Println("出队:", v)     // task1
    }

    fmt.Println("剩余大小:", q.Size())
}
```

##### 基于 `container/list`
```go
package main

import (
    "container/list"
    "fmt"
)

type QueueList[T any] struct {
    l *list.List
}

func NewQueueList[T any]() *QueueList[T] {
    return &QueueList[T]{l: list.New()}
}

func (q *QueueList[T]) Enqueue(v T) {
    q.l.PushBack(v)
}

func (q *QueueList[T]) Dequeue() (T, bool) {
    e := q.l.Front()

    if e == nil {
        var zero T

        return zero, false
    }

    q.l.Remove(e)
    return e.Value.(T), true
}

func (q *QueueList[T]) Front() (T, bool) {
    e := q.l.Front()

    if e == nil {
        var zero T

        return zero, false
    }

    return e.Value.(T), true
}

func (q *QueueList[T]) Empty() bool {
    return q.l.Len() == 0
}

func (q *QueueList[T]) Size() int {
    return q.l.Len()
}

func main() {
    q := NewQueueList[int]()
    q.Enqueue(5)
    q.Enqueue(6)
    if v, ok := q.Dequeue(); ok {
        fmt.Println("Dequeue:", v)
    }
    fmt.Println("Size:", q.Size())
}
```

## 小结

* 栈：

  * 后进先出，适合函数调用、表达式处理、DFS 等场景

  * C++ 有 `std::stack`

  * Go 可用 `slice` 或 `container/list`

* 队列：

  * 先进先出，适合 BFS、任务调度、生产者-消费者等

  * C++ 有 `std::queue`

  * Go 同样可基于 `slice` 或 `container/list` 实现
