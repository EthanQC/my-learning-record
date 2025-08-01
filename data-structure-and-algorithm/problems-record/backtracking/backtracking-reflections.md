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

