### 232. 用栈实现队列
#### 题目：https://leetcode.cn/problems/implement-queue-using-stacks/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/232-implement-queue-using-stacks.md)

太简单了没什么好说的，用数组自己实现一个栈，然后用两个栈，一个 `inStack`，一个 `outStack`，`in` 就用来放，`out` 就用来出，**出之前如果 `out` 是空的话就把 `in` 里的先全部 `Pop` 到 `out` 里**，这样出来的顺序刚好就是先进先出

### 225. 用队列实现栈
#### 题目：https://leetcode.cn/problems/implement-stack-using-queues/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/225-implement-stack-using-queues.md)

这道题也比较简单，虽然题目说用两个队列，但其实**用一个队列就可以实现栈的一系列操作，只要我们在 `Push` 元素进队列之后，再对队列里有的元素旋转一下就行，就从队首开始，让除了最后一个元素以外的所有元素都重新出队再入队一次，就是栈的顺序了**，例子如下：

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

这道题也不难，主要是学方法，思路是使用栈，因为栈是后进先出，**如果我们把左括号压到栈里，就会发现左括号的出栈顺序和右括号的匹配顺序刚好是一样的**

* 用一个 `map` 来先做好映射
  * 由于要入栈出栈所以是对单个字符操作，就用 `byte` 类型，而不是 `string`
* 然后遍历题目给的字符串，在循环里用个 `switch` 对不同情况判断就行
  * 如果是左括号就入栈
  * 如果是右括号就出栈，然后检查是否匹配

当然也有一些情况能直接判断的，比如上来看字符串是不是奇数长度，右括号先看栈是不是空的，最后遍历完栈是不是空的，`switch` 中的 `default` 应该是 `false`，记得写上即可

### 1047. 删除字符串中的所有相邻重复项
#### 题目：https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/1047-remove-all-adjacent-duplicates-in-string.md)

这道题跟上一题一样，也是一道经典的用栈来解决的题目，比较简单，逻辑也不复杂，就是**用栈后进先出的特性，然后拿当前循环拿到的字母跟栈顶的比，如果一样就把栈顶弹出，不一样就入栈**，学会思路就行

### 150. 逆波兰表达式求值
#### 题目：https://leetcode.cn/problems/evaluate-reverse-polish-notation/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/150-evaluate-reverse-polish-notation.md)

这道题虽然标的是中等题，但其实并不难，也是用栈来模拟，主要还是要理解什么是逆波兰表示法，由于题目说了只有四个运算符号，所以我们在遍历题目给的字符串的时候可以用 `switch` 来列这四种情况，然后把数字放到默认情况就好了，思路其实就是**遇到数字就入栈，遇到运算符就拿出栈最上方的两个数进行对应的运算**，见过学会即可

哦对然后还要知道 go 里面有 `strconv` 这个标准包，然后里面的 `Atoi` 函数可以将字符串类型转换为整型

### 239. 滑动窗口最大值
#### 题目：https://leetcode.cn/problems/sliding-window-maximum/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/239-sliding-window-maximum.md)

这道滑动窗口还是有一定难度的，主要是要学会用切片来模拟双向单调队列从而实现滑动窗口的方法，以及对于一些边界条件的处理要足够仔细，这题整体来说还是比较经典的，就不过多赘述了，其实很多东西背下来就行，比较老套的，等后续二刷/复习再整理

### 347. 前 K 个高频元素
#### 题目：https://leetcode.cn/problems/top-k-frequent-elements/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/stack-and-queue/347-top-k-frequent-elements.md)

这道题我个人感觉其实跟栈和队列没什么关系，因为用哈希法也能很好地解决，时间复杂度也很不错，具体思路就先不赘述了，以后再来补充吧