### 144. 二叉树的前序遍历
#### 题目：https://leetcode.cn/problems/binary-tree-preorder-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/144-binary-tree-preorder-traversal.md)

二叉树的遍历这几道题都是非常基础且非常简单的，主要分为**迭代法**和**递归法**，其中递归法由于我个人不太喜欢闭包的写法，所以用的是很简单也很简洁的写法

无论是递归还是迭代，前中后这三种遍历顺序都有统一的方法，只要改变代码执行的顺序即可，所以在下面两道题就不再赘述了

递归法要注意的是在 `append` 的时候，递归调用传进去是要加三个点的，`...` ，这样就能告诉编译器是**将返回的切片中的元素逐个传入，而不是直接把切片传进去**

迭代法相比递归而言会稍微麻烦一些，主要是用栈来模拟，需要多加一个 `frame` 结构体，通过 `visited` 这个变量来人为地**区分第一次访问和第二次访问**，这样就能很好地判断什么时候应该入栈，什么时候又应该把值添加到结果中，以便于达到像递归时天然分离的**进栈和出栈后访问**的效果

迭代需要注意的是在循环中，如果当前节点是空，那我们应该跳出本次循环直接执行下一次，也就是用 `continue`，**否则会因为访问空节点的属性导致报错**；另外由于我们是用栈来模拟，所以为了实现前中后序的遍历顺序，我们需要在压入栈的时候**把顺序反过来**（比如中序的左中右变为右中左）

整体而言这些都是基础，需要熟练掌握

### 94. 二叉树的中序遍历
#### 题目：https://leetcode.cn/problems/binary-tree-inorder-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/94-binary-tree-inorder-traversal.md)

### 145. 二叉树的后序遍历
#### 题目：https://leetcode.cn/problems/binary-tree-postorder-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/145-binary-tree-postorder-traversal.md)

### 102.二叉树的层序遍历
#### 题目：https://leetcode.cn/problems/binary-tree-level-order-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/102-binary-tree-level-order-traversal.md)

层序遍历跟前中后序遍历不同，前中后序遍历是 DFS(Depth First Search)，而层序遍历则是 BFS(Breadth First Search)，它强调**从左到右、从上到下依次地遍历每个节点**，最常用也最直接的方法就是**迭代法**，所以这里我们就不讨论递归法了

这道题也是基础，我们通过一个**队列**来实现层序遍历所要求的**先进先出**，这便是它最大的区别了，其他通过代码可以发现其实步骤和操作几乎是一样的，熟练掌握即可

需要注意的是由于层序遍历是按照层来从上到下遍历的，所以一般题目要求的返回值会是一个**二维数组**，而不是一维的，所以我们在遍历的时候也要按照层来，嵌套一个循环，然后在内层循环做入队和出队的操作，但时间复杂度仍然是 `O(n)`

### 107. 二叉树的层序遍历 II
#### 题目：https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/107-binary-tree-level-order-traversal-ii.md)

这道题也很基础，其实就是上一题正常层序遍历完之后加一个反转就好了，反转就直接用双指针头尾遍历一遍交换就行，不再赘述

### 199. 二叉树的右视图
#### 题目：https://leetcode.cn/problems/binary-tree-right-side-view/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/199-binary-tree-right-side-view.md)

这道题还是层序遍历的变种，嗯就是在正常遍历之后加一个判断，因为我们在做层序遍历的时候内层循环每次都会把当前层所有节点都遍历完，所以最后在把值放入结果切片的时候，只要**判断一下当前的 `i` 是否是这层的最后一个节点**，是的话才放，就可以很好地解决这题了

### 637. 二叉树的层平均值
#### 题目：https://leetcode.cn/problems/average-of-levels-in-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/637-average-of-levels-in-binary-tree.md)

这道题也是层序遍历的变种，其实就是把每层的值加起来然后求个平均就行，只是要注意这道题是对精度有要求的，所以平均值不能直接求，要先把 `sum` 和 `levelSize` 转成 `float64` 类型的再求平均

