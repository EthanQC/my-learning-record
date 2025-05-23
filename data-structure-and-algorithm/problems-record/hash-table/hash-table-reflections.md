### 242. 有效的字母异位词
#### 题目：https://leetcode.cn/problems/valid-anagram/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/hash-table/242-valid-anagram.md)

这题主要还是要**了解 go 底层对于字符串和字符的处理**，思路见过之后下次能再写出来就行：

* 声明一个**含有 26 个元素的空数组/切片**，索引是 `0 - 25`，刚好对应字母 `a - z`，这是我们自己定义的**映射**
* **分别遍历给的两个字符串，利用 `ch - 'a'` 来得到对应的下标**，从而实现对于数组的操作
    * 遍历第一个字符串时，每次循环，数组对应下标的元素加一
    * 遍历第二个字符串时，每次循环，数组对应下标的元素减一
* 最后遍历数组，判断数组里元素是否都是 0 即可

这是哈希相关的方法，时间复杂度只有 `O(n)`，go 语言底层对于 `'a'` 是**直接当作一个 `rune` 类型**（相当于 32 位的整型）来处理的，它对应的码点（ASCII）是 97

而字符变量在 go 里也是 `rune` 类型的，所以我们可以通过这种方式**得到数组对应的下标**，比如 `ch` 在遍历字符串时被赋值为 `c`，那此时 `ch - 'a'` 就是 `99 - 97`，结果是 2，刚好就对应数组中我们映射的下标为 2 的元素 c

### 1002. 查找共用字符
#### 题目：https://leetcode.cn/problems/find-common-characters/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/hash-table/1002-find-common-characters.md)

