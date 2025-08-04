### 455. 分发饼干
#### 题目：https://leetcode.cn/problems/assign-cookies/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/455-assign-cookies.md)

这道题比较简单，是贪心的入门题目，其实根据贪心的思想很容易就想到这题是需要先把大饼干给胃口大的孩子，或者把小饼干给胃口小的孩子，再用一个变量指示饼干的索引，就很轻松解决了

### 376. 摆动序列
#### 题目：https://leetcode.cn/problems/wiggle-subsequence/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/376-wiggle-subsequence.md)

这道题也不难，学会思路就可以了，考察的本质是对语言的掌控能力

### 53. 最大子数组和
#### 题目：https://leetcode.cn/problems/maximum-subarray/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/53-maximum-subarray.md)

这道题也不难，也是属于见过了学会就行，只是考熟练度的，还是用两个变量一个记录当前总和另一个记录最大和，方便我们比较

### 122. 买卖股票的最佳时机 II
#### 题目：https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/122-best-time-to-buy-and-sell-stock-ii.md)

同样的，更简单这道题，但得要见过才能有思路，利润最大的方式就是只要第一天的价格比第二天地，就第一天买入第二天卖，因为允许当天同时卖和买，所以把利润全部累加起来就行

### 55. 跳跃游戏
#### 题目：https://leetcode.cn/problems/jump-game/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/55-jump-game.md)

这题也不难，就是要见过才行，要不然很容易一下就没思路，如果当前下标都到不了的话，那就不可能往后走了，然后要及时更新能到的数值

### 45. 跳跃游戏 II
#### 题目：https://leetcode.cn/problems/jump-game-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/45-jump-game-ii.md)

这题也不难，就是稍微有点绕，跟上一题其实差不多，就是变化了一点，需要用三个变量了，见过学会就行

### 1005. K 次取反后最大化的数组和
#### 题目：https://leetcode.cn/problems/maximize-sum-of-array-after-k-negations/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/1005-maximize-sum-of-array-after-k-negations.md)

这题也不难，只是确实有点绕，而且要看清楚题，题目说的是同个元素可以多次取反，所以思路就是优先反转负数，然后再在最小的那个数上根据剩余反转次数的奇偶来操作

### 134. 加油站
#### 题目：https://leetcode.cn/problems/gas-station/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/134-gas-station.md)

这题也是一样的，就是容易没有思路，主要是要见过，贪心的策略是如果当前的容量已经小于零了，那就直接重置起点和容量

### 135. 分发糖果
#### 题目：https://leetcode.cn/problems/candy/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/135-candy.md)

这道题还是挺难的，不要想简单了，一个是**要从左到右和从右到左遍历两遍**，另一个是**如果是递增的那糖的数量也是要递增的**，要看清楚题意，所以是要两个循环才能解决，而且最后为了同时满足左右的约束，结果是**取两遍中哪个大就要哪个，而不是加在一起**

### 860. 柠檬水找零
#### 题目：https://leetcode.cn/problems/lemonade-change/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/860-lemonade-change.md)

这道题其实很简单，主要是别想复杂了，就分三种情况讨论就是了，只不过别忘了用 `switch`，虽然不怎么常用但也是要会的，并且在用到的时候要能想起来

### 406. 根据身高重建队列
#### 题目：https://leetcode.cn/problems/queue-reconstruction-by-height/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/greedy-algorithm/406-queue-reconstruction-by-height.md)

