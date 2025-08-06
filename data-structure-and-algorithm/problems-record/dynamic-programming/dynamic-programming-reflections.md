### 509. 斐波那契数
#### 题目：https://leetcode.cn/problems/fibonacci-number/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/dynamic-programming/509-fibonacci-number.md)

非常经典的动态规划的入门题，迭代就行，用两个变量，题目也把递推公式给出来了，动态规划的思路就是：最优子结构（递推式、多个规模更小的问题）-记忆化存储-状态转移

### 70. 爬楼梯
#### 题目：https://leetcode.cn/problems/climbing-stairs/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/dynamic-programming/70-climbing-stairs.md)

这道题就是斐波那契数列，最基本的想法就是找规律，见过就行，详细一点的思路推导就是如果要爬到第 `i` 阶，最后一步要么是从 `i−1` 阶跨 `1` 阶上来，要么是从 `i−2` 阶跨 `2` 阶上来

### 746. 使用最小花费爬楼梯
#### 题目：https://leetcode.cn/problems/min-cost-climbing-stairs/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/dynamic-programming/746-min-cost-climbing-stairs.md)

这道题也是一样的，还是斐波那契数列，但就是要加上一个花费，需要取最小，本质并不难

### 62. 不同路径
#### 题目：https://leetcode.cn/problems/unique-paths/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/dynamic-programming/62-unique-paths.md)

这道题是我们第一次接触二维 dp，嗯还是以学方法为主就好，是要用一个二维数组，不要忘记对第一行和第一列都进行初始化，然后直接从第二行第二列的元素开始

### 63. 不同路径 II
#### 题目：https://leetcode.cn/problems/unique-paths-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/dynamic-programming/63-unique-paths-ii.md)

这道题跟上一题的思路是完全一样的，也是二维 dp，但要注意初始化的方式有略微的改变，以及如何分别计算二维数组行和列的长度也要熟悉

### 63. 不同路径 II
#### 题目：https://leetcode.cn/problems/unique-paths-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/dynamic-programming/63-unique-paths-ii.md)

