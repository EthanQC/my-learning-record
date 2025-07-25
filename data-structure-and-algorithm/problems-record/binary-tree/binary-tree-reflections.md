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

### 429. N 叉树的层序遍历
#### 题目：https://leetcode.cn/problems/n-ary-tree-level-order-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/429-n-ary-tree-level-order-traversal.md)

这道题也是层序遍历的变种，很简单，由于现在有多个子节点了，我们只需要将原本的分别判断左右子节点**改成用一个循环来遍历所有的子节点**，然后在循环内如果当前子节点不为空就放到队列里就行，其他都不用改

### 515. 在每个树行中找最大值
#### 题目：https://leetcode.cn/problems/find-largest-value-in-each-tree-row/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/515-find-largest-value-in-each-tree-row.md)

嗯这道题也是层序遍历的变种，只要加个比较就可以了，需要注意的是 **`max` 变量的初始化**，要用本层的第一个节点的值来初始化，这样就不会产生负数的影响了

### 116. 填充每个节点的下一个右侧节点指针
#### 题目：https://leetcode.cn/problems/populating-next-right-pointers-in-each-node/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/116-populating-next-right-pointers-in-each-node.md)

这道题比较有意思，有两种方法，一种还是原本的层序遍历的变种，另一种是比较独特的**指针法**，首先要注意题目给的是一颗**完美二叉树**，所以如果一个节点存在，那它的左右子节点都是肯定会存在的

第一种方法其实就是**多声明一个空指针，然后在内层循环判断这个指针是否为空，是的话就把它的 `Next` 指向当前节点，在判断外就把这个空指针直接指向当前节点**，这样就能很好地解决这道题了，主要是这种对于指针记录节点的处理方式要熟悉，可以很好地**避免越界访问**的问题

第二种方法是空间开销为 `O(1)` 的指针法，它就是**针对完美二叉树**的，其实是很好理解的，见过之后学会就行，**思路**也是用两层循环，外层是指向每层的最左节点，每次都往下指最左的节点，内层就遍历当前层的所有节点，先串联左右子节点，然后如果当前节点的下一个节点非空，再把当前的右子节点跟下一个节点的左子节点连接起来即可

### 117. 填充每个节点的下一个右侧节点指针 II
#### 题目：https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/117-populating-next-right-pointers-in-each-node-ii.md)

这道题跟上道题是完全一样的，只是二叉树不是完美二叉树了，所以就没有指针法了，直接用层序遍历就可以很好地解决了

### 104. 二叉树的最大深度
#### 题目：https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/104-maximum-depth-of-binary-tree.md)

这道题很简单，记录下一共有多少层即可

### 111. 二叉树的最小深度
#### 题目：https://leetcode.cn/problems/minimum-depth-of-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/111-minimum-depth-of-binary-tree.md)

这道题也很简单，也是层序遍历的变种，只需要注意**只有左右子节点都为空时才是最短**，这个时候返回即可

### 226. 翻转二叉树
#### 题目：https://leetcode.cn/problems/invert-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/226-invert-binary-tree.md)

这道题可以用的方法非常多，前中后序的迭代、遍历和层序遍历都可以用，但要注意的是中序遍历由于会导致某颗子树被处理两遍或跳过（如果不特殊调整顺序的话），所以这题我们就不用中序遍历了

最本质的还是要知道**翻转二叉树只需要把每个节点的左右子节点交换就可以实现**，如果使用层序遍历就直接加个交换就好，使用前序或者后序遍历的话要注意这道题的写法，不过写多了就会发现其实各种遍历的代码都差不多，熟练运用即可

### 101. 对称二叉树
#### 题目：https://leetcode.cn/problems/symmetric-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/101-symmetric-tree.md)

这道题其实不难，也不涉及之前用到的各种遍历（由于用递归是最简单的，所以这里不讨论其他解法），它本身强调的是对于**一棵树拆分成左右子树后，对左右子树这两棵树的遍历并判断它们是否是镜像的**，用**递归**会很方便地完成这一点，只要注意只有两个子节点都为空时才代表对称，否则都是不对称

### 222. 完全二叉树的节点个数
#### 题目：https://leetcode.cn/problems/count-complete-tree-nodes/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/222-count-complete-tree-nodes.md)

能用层序遍历很快地解决这道题目，但如果想进一步优化的话，可以**利用完全二叉树的特性配合递归**解决，思路是先求一下左右子树的深度（直接左边一路走下去就行），然后判断，**如果左右子树深度相同，那左子树就是满二叉树，我们要递归求右子树的节点数，否则右子树就是满二叉树，递归求左子树的节点数**

用左子树举例，注意左子树是满二叉树时的节点数是 `2^d - 1`，我们用 `1 << l` 来求，表示把整数 `1` 左移 `l` 位，也就是 `2` 的 `l` 次方，再加上根节点，再加上用递归去求右子树的节点个数，这样全加起来就是整棵完全二叉树的节点个数了

### 110. 平衡二叉树
#### 题目：https://leetcode.cn/problems/balanced-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/110-balanced-binary-tree.md)

这道题还是有点意思的，并不是模板题，主要是用递归来解决的，其实还是把二叉树不断拆分成左子树和右子树，思路是以 -1 为标识，对每个节点都检查一次它左右子树的高度差，如果不平衡就返回 -1，如果平衡就返回子树的高度，学会思路即可

### 257. 二叉树的所有路径
#### 题目：https://leetcode.cn/problems/binary-tree-paths/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/257-binary-tree-paths.md)

这道题直接用**递归**就行了，不用管那些莫名其妙的什么回溯，后面会涉及的，而且迭代法这题是比较麻烦的，还是递归方便，其实就是普通的遍历，如果遇到叶子节点那就只返回当前节点，如果不是叶子节点就把路径拼起来，只需要注意是用 `strconv` 这个包的 `Itoa` 函数来转换类型，然后用 `+` 连接

### 404. 左叶子之和
#### 题目：https://leetcode.cn/problems/sum-of-left-leaves/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/404-sum-of-left-leaves.md)

简单的递归即可解决，只是别忘了要接收内层调用的值，要不然累加的结果是不对的

### 513. 找树左下角的值
#### 题目：https://leetcode.cn/problems/find-bottom-left-tree-value/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/513-find-bottom-left-tree-value.md)

层序遍历轻松解决

### 112. 路径总和
#### 题目：https://leetcode.cn/problems/path-sum/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/112-path-sum.md)

只要用目标值减去每次迭代经过节点的值，然后在到叶子节点的时候判断是否刚好为 0 就可以了，这种写法很优雅也很高效，要好好理解

### 113. 路径总和 II
#### 题目：https://leetcode.cn/problems/path-sum-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/113-path-sum-ii.md)

这道题还是用递归，但要自己传新的参数，其实就是 112 和 257 这两道题结合起来，只需要注意在处理结果时要先拷贝一个临时切片，要不然直接值传递只是传递了指针，实际上指的还是原本的同一个切片，会导致结果中的值被修改

### 106. 从中序与后序遍历序列构造二叉树
#### 题目：https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/106-construct-binary-tree-from-inorder-and-postorder-traversal.md)

这道题还是挺恶心的我觉得，因为它虽然用的主要还是递归，但对于两个数组的边界情况的处理真的很繁琐，且无法避免，可能在面试的时候遇到一紧张就容易写不出来，属于只能增加熟练度硬磕记方法的题

主要思路就是先用一个 map 记录一下中序遍历的数组索引，然后写个递归，后序遍历的最后一个元素就是根节点，再根据这个元素找到根节点在中序中的位置，这样位置的左边就是左子树，右边就是右子树，记录一下就可以根据边界条件来递归了

### 105. 从前序与中序遍历序列构造二叉树
#### 题目：https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/105.construct-binary-tree-from-preorder-and-inorder-traversal.md)

这道题也是跟上一题可以说是几乎完全一样的，思路完全相同，只是要注意边界情况的处理，因为前序遍历和后序遍历的数组中根节点的位置不同，所以对数组的划分也会产生相应的变化，要分清楚

### 654. 最大二叉树
#### 题目：https://leetcode.cn/problems/maximum-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/654-maximum-binary-tree.md)

这道题其实不难，就是不要想复杂了，题目已经告诉了我们思路以及如何递归了，跟着做就好，只是要对切片这个操作本身比较熟悉才行

### 617. 合并二叉树
#### 题目：https://leetcode.cn/problems/merge-two-binary-trees/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/617-merge-two-binary-trees.md)

这道题还是用递归，说实话其实层序遍历也可以，但在可以选的时候，递归总是要更方便的，其实也不用新搞一个树，直接把其中一个树当成合并后的树来操作就可以了，这样也会更方便，递归一定要熟练啊啊啊

### 700. 二叉搜索树中的搜索
#### 题目：https://leetcode.cn/problems/search-in-a-binary-search-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/700-search-in-a-binary-search-tree.md)

这道题其实非常简单，因为二叉搜索树的特点其实就是**左子树比根小，右子树比根大**，只要记住这十二个字就能轻松解救，使用递归和迭代都非常简单

### 98. 验证二叉搜索树
#### 题目：https://leetcode.cn/problems/validate-binary-search-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/98-validate-binary-search-tree.md)

讨厌这道题，这题主要还是要用到二叉搜索树的性质，就是中序遍历的二叉搜索树，结果的数组一定会是升序的，所以要通过这个来验证，递归或者迭代都可以，但要注意的是要先声明一个全局的 prev 变量，来方便我们比较是否是升序，并且要把迭代单独搞个函数出来，还要在原函数本身每次都把 prev 置成 nil，防止多次调用时被前面的其他数据影响，迭代法这里现在就先不讨论了，本质还是一样的

### 530. 二叉搜索树的最小绝对差
#### 题目：https://leetcode.cn/problems/minimum-absolute-difference-in-bst/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/530-minimum-absolute-difference-in-bst.md)

这道题其实也不难，主要是要对二叉搜索树的题目的模板要熟悉，还是用中序遍历递归，遍历完之后其实就是相当于在一个有序的数组中找最小的差值，就很简单啦

### 501. 二叉搜索树中的众数
#### 题目：https://leetcode.cn/problems/find-mode-in-binary-search-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/501-find-mode-in-binary-search-tree.md)

嗯我不喜欢这道题，主要是在一个有序数组中找众数本身就是一件比较麻烦的事情，其实这题就是拆分成了这件事和一个中序遍历，没什么好说的，只要学会如何找众数就好了，还是不喜欢闭包的写法所以分成了几个函数

### 236. 二叉树的最近公共祖先
#### 题目：https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/236-lowest-common-ancestor-of-a-binary-tree.md)

这道题要用后序遍历递归，见过了学会思路即可，主要是如果左右都不为空的话就返回当前节点，如果只有一边非空那就返回非空的那边，这样就能找到了

### 235. 二叉搜索树的最近公共祖先
#### 题目：https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/binary-tree/235-lowest-common-ancestor-of-a-binary-search-tree.md)

这道题就是上一题的普通二叉树变成二叉搜索树了，就更简单了，只要分别判断 `p`、`q` 的值跟 `root` 的大小，如果都大就去右边，如果都小就去左边，如果都不是就返回当前节点，都不用递归了，直接循环即可解决

