---
title: backtracking reflections
date: '2025-09-03'
tags:
  - backtracking
summary: >-
  [我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/77-combinations.md)
---
### 77. 组合
#### 题目：https://leetcode.cn/problems/combinations/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/77-combinations.md)

这是我们第一次接触到回溯，刚好这道题也是一道比较经典的回溯的题目，那就好好讲一下，虽然回溯有点难，但它**本质还是枚举**，所以它的效率其实并不高

首先让我们明确一下回溯的步骤：**结束、枚举、剪枝、选择、递归、回退**，我们只要记住这六步，便能很顺利地解决回溯的相关问题，这题中的 `n-i+1` 是从 `i` 到 `n` 还剩下数字的数量，另外需要注意回溯一定要深拷贝，要用到 `copy` 函数，不能直接给，否则会影响到原本的底层数组

另外，这题剪枝的部分是可以优化的，即把 `len(path) + n - i + 1 <= k` 这个条件变形一下，就得到 `i <= n - (k - len(path)) + 1`，这样可以省去判断和 `break` 的部分

### 216. 组合总和 III
#### 题目：https://leetcode.cn/problems/combination-sum-iii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/216-combination-sum-iii.md)

还是一样的回溯思路，结束枚举剪枝选择递归回退，不过其实剪枝在哪里都行，然后这题是需要额外注意一个剪枝，就是**如果已经数量或者大小超了，就直接返回**，另外就是 `sum` 这个变量**作为参数传递**是比较优雅和方便的

### 17. 电话号码的字母组合
#### 题目：https://leetcode.cn/problems/letter-combinations-of-a-phone-number/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/17-letter-combinations-of-a-phone-number.md)

嗯这道题还是回溯，但会麻烦很多，先要搞个映射记录数字和字母的对应关系，然后还要传一个位置变量方便我们对字符串进行操作，嗯总之对于熟练度的要求是比较高的，否则很容易东漏一点西漏一点，不过这题不需要剪枝

### 39. 组合总和
#### 题目：https://leetcode.cn/problems/combination-sum/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/39-combination-sum.md)

这道题也有点麻烦，嗯主要是有两处需要剪枝，就是和比目标值大时直接返回，还有如果和和当前值已经比目标值大了那也直接返回，再就是需要先用 `sort` 包里的 `Ints` 函数给数组排下序，因为题目没有说给的数组都是升序的，其他就正常回溯即可，只是选择和回退时需要操作两个变量

### 40. 组合总和 II
#### 题目：https://leetcode.cn/problems/combination-sum-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/40-combination-sum-ii.md)

这道题跟上一题差不多，只是不能重复用了，所以我们只需要在上一题代码的基础上改两处代码，一处是要把在递归时传递的 `start` 变量从 `i` 变成 `i + 1`，另一处是要**增加一下去重的逻辑**，因为题目说解集不能包含重复的组合，所以直接从第二个数开始，如果当前 `i` 对应的数跟前一个相同，直接 `continue` 跳过本次循环即可

### 131. 分割回文串
#### 题目：https://leetcode.cn/problems/palindrome-partitioning/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/131-palindrome-partitioning.md)

正常回溯即可，判断回文只需要用双指针法就能轻松实现，题目本身并不难，也不涉及剪枝什么的，只是在选择时要注意添加的应该是一个串，而不是某个字母

### 93. 复原 IP 地址
#### 题目：https://leetcode.cn/problems/restore-ip-addresses/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/93-restore-ip-addresses.md)

这题比较麻烦，要注意两处剪枝，还要用到两个包函数，先不多说了

### 78. 子集
#### 题目：https://leetcode.cn/problems/subsets/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/78-subsets.md)

正常回溯，不过跟前面几题都不一样，感觉回溯难就是难在分割的方式和剪枝

### 90. 子集 II
#### 题目：https://leetcode.cn/problems/subsets-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/90-subsets-ii.md)

跟上一题一样的，加个排序和去重就行

### 491. 非递减子序列
#### 题目：https://leetcode.cn/problems/non-decreasing-subsequences/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/491-non-decreasing-subsequences.md)

也是正常递归，但要注意不用排序，而且收集结果时的条件和去重的方式要注意，同时还要注意保证非递减的方式，不是跟前一个比，而是跟当前的最新的元素比

### 46. 全排列
#### 题目：https://leetcode.cn/problems/permutations/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/46-permutations.md)

也是回溯，但逻辑跟组合的不太一样了，挺烦人的反正，记住吧

### 47. 全排列 II
#### 题目：https://leetcode.cn/problems/permutations-ii/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/47-permutations-ii.md)

记住吧，这个去重太绕了

### 332. 重新安排行程
#### 题目：https://leetcode.cn/problems/reconstruct-itinerary/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/332-reconstruct-itinerary.md)



### 51. N 皇后
#### 题目：https://leetcode.cn/problems/n-queens/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/332-reconstruct-itinerary.md)



### 37. 解数独
#### 题目：https://leetcode.cn/problems/sudoku-solver/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/backtracking/37-sudoku-solver.md)

