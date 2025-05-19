### 203. 移除链表元素
#### 题目：https://leetcode.cn/problems/remove-linked-list-elements/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/203-remove-linked-list-elements.md)

这道题主要是考察基础的对链表的理解，非常简单，主要是用 `dummyHead` 和 `current` 这两个节点来**遍历整个链表**

主要是对于如何初始化，以及如何操作链表要熟悉

### 707. 设计链表
#### 题目：https://leetcode.cn/problems/design-linked-list/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/203-remove-linked-list-elements.md)

这题主要是考察**链表基础的增加、查找和删除操作**，相当于自己实现一个链表，我这里的解答只是**单向链表**的版本，但我会在数据结构那里完整补充的

* 还是同样的**需要 `cur` 和虚拟头节点来方便我们遍历整个链表**，从而实现操作
* 别忘了增加/删除一个节点后，链表的长度也要更改
* 对于 `index` 的定位要搞清，才能不混淆，举例子脑内模拟跑一下是最好的方法

主要是 Go 语言的实现方式可能跟 C++ 的会有些不同，体现在类的区别上

### 206. 反转链表
#### 题目：https://leetcode.cn/problems/reverse-linked-list/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/203-remove-linked-list-elements.md)

这道题有**双指针法**和**递归法**两种方法可以解决，并不难，见过一次之后就能掌握基本的方法，其实就是遍历链表然后把链表节点之间的指针转向一下

* 双指针法
  * cur 指针表示当前节点，pre 指针表示当前节点的前一个节点
  * 要注意 pre 的初始化方式
* 递归法
  * 等涉及到分治、二叉树、图论什么的用递归比较方便的再学

### 24. 两两交换链表中的节点
#### 题目：https://leetcode.cn/problems/swap-nodes-in-pairs/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/24-swap-nodes-in-pairs.md)

这题虽然标的是中等，但其实也并不难，只要学会思路就行了

* **循环外**常规的两个指针 `dummy` 和 `cur`，用来遍历整个链表
* **循环内**使用 `first` 和 `second` 两个指针，用来记录 `cur` 在更改前要交换的第一个节点和第二个节点
* 注意 `dummy` 的**初始化方式**，不要直接 `dummy := head`，这样会导致越界

不要被吓到~

### 19. 删除链表的倒数第 N 个结点
#### 题目：https://leetcode.cn/problems/remove-nth-node-from-end-of-list/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/19-remove-nth-node-from-end-of-list.md)

这题也是，虽然中等但不难其实，也是用**双指针法**，主要是用**快慢指针**来**将倒数转化为正数**，方便我们的删除

* 主要是用 `fast` 和 `slow` 两个指针来**分别遍历整个链表**，再配合上`dummy` 方便我们返回删除后的头节点
* `fast` 先走 n+1 步，因为这样能让 `fast` 走完之后和 `slow` 之间的距离刚好是 n
* 再让 `fast` 和 `slow` 一起走，直到 `fast` 走到链表的末尾，这时 `slow` 的下一个节点刚好就是要删除的节点，正常删除即可

灵活应用双指针法就好，及时反思总结，下次见到原题或类似题目要识别出来是双指针法的哪个方法的应用

### 160. 相交链表
#### 题目：https://leetcode.cn/problems/intersection-of-two-linked-lists/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/linked-list/160-intersection-of-two-linked-lists.md)

这道题目虽然是简单题，但挺多坑的，即使知道思路可能在实现时也会出现各种问题，主要还是用**双指针法**，具体思路和要注意的细节如下：

* 两个链表，用两个指针 `pA` 和 `pB` 分别指向这两个链表的头节点，**每次循环这两个指针都各自前进一步**
* **如果遇到链表的末尾，就将指针指向另一个链表的头节点**
* 直到两个指针相遇或都为空，循环才会结束，返回一个指针即可

这种遍历方式保证了**两个指针在遍历结束后的总步长是一样的**，都是 `a + b + c`，a 和 b 是两个链表分别的长度，c 是相交部分的长度，这样也**同时保证了即使可能两个链表在相交部分外的长度区别很大，也能用一次遍历找到可能相交的节点**；如果没有相交的话，则两个指针都会走到 `nil`，同样符合 `pA == pB` 退出循环的条件

注意事项：

* `pA` 和 `pB` 的**初始化方式**，因为这两个都是真正意义上的指针，不会涉及虚拟头节点，所以不要用 `&ListNode{Name: head}` 来初始化
* 我们**不需要新建节点，只需要在原链表上操作即可**，这样也不会带来赋值的问题，题目要求的也是返回交点就行

