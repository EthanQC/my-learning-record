## 基本概念
#### 时间复杂度
时间复杂度描述的是**算法执行所需时间与输入规模之间的关系**，它反映了算法在处理数据量增大时所需时间的增长速度

换句话说，时间复杂度告诉我们一个算法运行多少步（或基本操作次数）随着问题规模 n 变化的**趋势**

* **关注增长趋势**： 通常不关心常数项和低阶项，而关注输入规模大时的**主要增长部分**
* 最坏情况、平均情况、最好情况：
    * **最坏情况**（Worst-case）：算法在最不利情况下的执行时间
    * **平均情况**（Average-case）：考虑各种输入的平均运行时间
    * **最好情况**（Best-case）：在最优输入下的运行时间
    * 但通常在实际分析中，**最坏情况是主要关注点**

#### 空间复杂度
空间复杂度描述的是**算法在运行过程中所占用的内存空间与输入规模之间的关系**

它包括存储输入数据、辅助数据结构、递归调用的栈空间等**占用的内存总量**

* **固定空间与动态分配空间**： 许多算法使用固定量的额外空间（O(1)），也有的算法需要额外的存储空间与输入规模相关（例如，排序算法中申请的临时数组）
* **原地算法**： 如果一个算法在**不使用额外的数据结构**的情况下完成操作，我们称其为原地算法，其空间复杂度通常为 O(1)

## 常见记法
在分析算法复杂度时，我们通常使用大写 O 表示法以及其他记法来描述上界、下界及紧确界

#### 大 O 记法 
`O(⋅)` 含义： 表示**算法在最坏情况下的渐进上界**

举例：

冒泡排序的时间复杂度为 `O(n^2)` 表示算法的比较次数在最坏情况下随着数据量 n 的平方增长

#### Ω（大 Ω）记法
含义： 表示**算法的渐进下界**

举例：

一个算法至少需要 `Ω(n)` 的时间，也就是说，在任何情况下，算法至少需要 n 次操作

#### Θ（大 Θ）记法
含义： 表示算法的渐进紧确界，即**上界和下界都在同一个数量级内**

举例：

二分查找算法的时间复杂度是 `Θ(logn)`，表示在最坏情况和最好情况其增长速度均是对数级别

## 如何计算时间复杂度
计算时间复杂度的核心思想是：

数一数算法中**基本操作**（如赋值、比较、加法等）**执行的次数**，并分析它们**随输入规模 n 如何变化**

#### 分析简单循环
例子 1：单层 for 循环

    for (int i = 0; i < n; i++)
    {
        // 执行常数次操作 O(1)
    }

循环执行次数为 n 次，每次操作为常数时间，所以总时间为 O(n)

例子 2：嵌套循环

    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            // 执行常数次操作 O(1)
        }
    }

外层循环执行 n 次，每次内层循环也执行 n 次，因此总共执行 n×n=n^2 次操作，总时间为 `O(n^2)`

#### 分析递归算法
等题目遇到了再说，现在看递归总是感觉有点晕晕的看不明白

## 如何计算空间复杂度
空间复杂度的计算一般考虑算法在运行过程中除输入数据外**额外**申请内存的大小

#### 常见情况
##### 原地算法：

只使用了少量的辅助变量，无论数据规模 n 如何，额外空间都是常数级别 O(1)

##### 需要辅助数据结构的算法：

如果算法需要用到辅助数组、哈希表或者递归调用的栈，额外空间就会随着输入规模增加

例如**归并排序**在归并过程中可能需要一个**临时数组来存储元素**，空间复杂度为 `O(n)`

**递归算法**一般需要**额外的栈空间**，其最大深度也会影响空间复杂度，如二分查找递归的空间复杂度为 `O(logn)`

#### 分析步骤
* **明确每个变量、数据结构占用的内存**：
    * 普通变量（整型、布尔类型等）通常视为 O(1)
    * 数组、链表等按照元素个数来计算，如长度为 n 的数组空间复杂度为 O(n)
* **考虑递归时的调用栈**：
    * 每一次递归调用都会占用一定栈空间，计算递归深度，乘以每层递归的额外空间量
* **合计所有的辅助空间**：
    * 将所有额外申请的空间（不包括输入数据本身）进行总和，就是该算法的空间复杂度

## 推荐阅读
均为代码随想录相关文章，但需要先有一定算法基础：

* 时间复杂度
    * [时间复杂度常见概念分析](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/%E5%89%8D%E5%BA%8F/%E6%97%B6%E9%97%B4%E5%A4%8D%E6%9D%82%E5%BA%A6.md)
    * [递归算法的时间复杂度](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/%E5%89%8D%E5%BA%8F/%E9%80%92%E5%BD%92%E7%AE%97%E6%B3%95%E7%9A%84%E6%97%B6%E9%97%B4%E5%A4%8D%E6%9D%82%E5%BA%A6.md)
* 空间复杂度
    * [空间复杂度常见概念分析](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/%E5%89%8D%E5%BA%8F/%E7%A9%BA%E9%97%B4%E5%A4%8D%E6%9D%82%E5%BA%A6.md)
* [递归算法的时间、空间复杂度分析](https://github.com/youngyangyang04/leetcode-master/blob/master/problems/%E5%89%8D%E5%BA%8F/%E9%80%92%E5%BD%92%E7%AE%97%E6%B3%95%E7%9A%84%E6%97%B6%E9%97%B4%E4%B8%8E%E7%A9%BA%E9%97%B4%E5%A4%8D%E6%9D%82%E5%BA%A6%E5%88%86%E6%9E%90.md)