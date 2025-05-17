### 203. 移除链表元素
#### 题目：https://leetcode.cn/problems/remove-linked-list-elements/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/203-remove-linked-list-elements.md)

这道题主要是考察基础的对链表的理解，非常简单，主要是用 `dummyHead` 和 `current` 这两个节点来遍历整个链表

主要是对于如何初始化，以及如何操作链表要熟悉

### 707. 设计链表
#### 题目：https://leetcode.cn/problems/design-linked-list/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/203-remove-linked-list-elements.md)

这题主要是考察链表基础的增加、查找和删除操作，相当于自己实现一个链表，我这里的解答只是单向链表的版本，但我会在数据结构那里完整补充的

* 还是同样的需要 cur 和虚拟头节点来方便我们遍历整个链表，从而实现操作
* 别忘了增加/删除一个节点后，链表的长度也要更改
* 对于 index 的定位要搞清，才能不混淆，举例子脑内模拟跑一下是最好的方法

主要是 Go 语言的实现方式可能跟 C++ 的会有些不同，体现在类的区别上

### 206. 反转链表
#### 题目：https://leetcode.cn/problems/reverse-linked-list/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/203-remove-linked-list-elements.md)

这道题有双指针法和递归法两种方法可以解决，并不难，见过一次之后就能掌握基本的方法，其实就是遍历链表然后把链表节点之间的指针转向一下

* 双指针法
  * cur 指针表示当前节点，pre 指针表示当前节点的前一个节点
  * 要注意 pre 的初始化方式
* 递归法
  * 等涉及到分治、二叉树、图论什么的用递归比较方便的再学

### 24. 两两交换链表中的节点
#### 题目：https://leetcode.cn/problems/swap-nodes-in-pairs/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/24-swap-nodes-in-pairs.md)

这题虽然标的是中等，但其实也并不难，只要学会思路就行了

* 循环外常规的两个指针 `dummy` 和 `cur`，用来遍历整个链表
* 循环内使用 `first` 和 `second` 两个指针，用来记录 `cur` 在更改前要交换的第一个节点和第二个节点

不要被吓到~