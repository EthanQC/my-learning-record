### 232. 用栈实现队列
#### 题目：https://leetcode.cn/problems/implement-queue-using-stacks/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/232-implement-queue-using-stacks.md)

太简单了没什么好说的，用数组自己实现一个栈，然后用两个栈，一个 inStack，一个 outStack，in 就用来放，out 就用来出，出之前如果 out 是空的话就把 in 里的先全部 Pop 到 out 里，这样出来的顺序刚好就是先进先出

### 225. 用队列实现栈
#### 题目：https://leetcode.cn/problems/implement-stack-using-queues/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/225-implement-stack-using-queues.md)

这道题也比较简单，虽然题目说用两个队列，但其实用一个队列就可以实现栈的一系列操作，只要我们在 Push 元素进队列之后，再对队列里有的元素旋转一下就行，就从队首开始，让除了最后一个元素以外的所有元素都重新出队再入队一次，就是栈的顺序了，例子如下：

* Push(1)
  * append 1 → [1]
  * 旋转次数 = n-1 = 1-1 = 0，不转
→ 结果 q.data = [1]
* Push(2)
  * append 2 → [1, 2]
  * 旋转次数 = n-1 = 2-1 = 1：
    * 第 1 次出队得到 1，队列变 [2]，再入队变 [2,1]
→ 结果 q.data = [2,1]
* Push(3)
  * append 3 → [2,1,3]
  * 旋转次数 = n-1 = 3-1 = 2：
    * 出队 2 → [1,3] → 入队 → [1,3,2]
    * 出队 1 → [3,2] → 入队 → [3,2,1]
→ 结果 q.data = [3,2,1]

只要对队列和栈有一定熟练度，这题和上一题见过之后，学会方法就好，并没有太大难度

### 20. 有效的括号
#### 题目：https://leetcode.cn/problems/valid-parentheses/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/20-valid-parentheses.md)

