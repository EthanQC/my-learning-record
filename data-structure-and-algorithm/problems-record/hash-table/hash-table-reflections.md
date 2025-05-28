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

这道题主要也还是用到了上一题的**哈希法映射方式**，以此来实现对于字符串数组的遍历和对每个字符出现次数的统计，虽然是简单题，但逻辑还是有点绕的，具体思路如下：

* 声明一个含有 26 个元素的空数组，还是对应字母 `a - z`，将这个空数组用已给数组的第一个字符串来初始化，记录初始的映射，也同样还是用 `counts[ch - 'a']++` 来记录字符出现次数
* 使用一个循环，**循环内**声明另一个 `temp` 来记录其他字符串中字符的出现次数
  * 再嵌套一个循环遍历这个字符串，记录次数
  * 再使用另一个循环，用来**比较 `counts` 和 `temp` 中的所有元素，如果同一索引下 `counts` 的元素更大，就将 `temp` 赋给 `counts`**
* 最后再声明一个空数组来记录要返回的结果，也是循环里再嵌套一个循环，内层循环里直接用 `append` 来为这个空数组追加值

注意事项：

* 这道题的**时间复杂度是 `O(n * m)`**，而不是 `O(n ^ 2)`，其中 `n` 是字符串数组的长度，`m` 是每个字符串的长度，这两个是有本质区别的
  * **并不是所有嵌套循环的时间复杂度都是 `O(n ^ 2)`**，这里内层循环的次数 `m` 和 `n` 是无关的，代表的意义也不一样
* **`temp` 一定要在循环内声明**，如果在循环外声明，在遇到下一个新的字符串时，`temp` 的所有元素并不都是 0
  * 会导致可能某个字母只在两个字符串里出现，但并没有在第三个字符串里出现，却还是返回成结果了
* 最后记录返回结果时别忘了要**用 `string()` 转成字符串类型**的，否则 `'a' + i` 的底层还是 `rune` 类型的，直接 `append` 会报错

### 349. 两个数组的交集
#### 题目：https://leetcode.cn/problems/intersection-of-two-arrays/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/hash-table/349-intersection-of-two-arrays.md)

这题主要是要对 **go 语言中如何用 `map` 模拟集合**的方法比较熟练，主要考察的还是对语言的掌控能力，本质并不难，具体思路如下：

* 先**比较两个数组的长度**，保证是对更短的那个切片建哈希，节省空间
  * 递归一下，就是在 if 里重新调用这个函数，把两个数组的位置颠倒一下就行
* **用 `make(map[int]struct{}, len(nums1))` 来模拟集合**，其中 `int` 表示键是整型，`struct{}` 表示值为空的结构体类型，这样通过遍历第一个数组来给键赋值即可，不用关心值，值的赋值方式直接**用 `struct{}{}` 表示是一个空的结构体来为键占位**就行
* 再模拟另一个集合并遍历另一个数组，这次遍历是为了**比较第二个数组中的值是否在第一个数组中出现过**，判断条件是 **`if _, ok := set1[v]; ok {}`**，这里要对如何通过已知的键来获取值的方式比较熟悉（顺便校验键是否存在），`ok` 是一个布尔类型的变量，如果出现过就把同样的值赋给这个新的集合的键
  * 另一种获得键值对的方式是用 `range`
* 最后创建一个切片，将第二个集合的键用 `append` 追加到这个切片中，返回即可

注意事项：

* 对于如何用 `map` 模拟集合一定要熟悉，特别是如何赋空值，要能看懂
* 对于如何获取键值，相关操作要熟悉
* 最后的**切片初始化时，长度要为 0，容量才是第二个集合的长度**，否则在追加时切片中会额外多出来几个零（如果只指定长度为第二个集合的长度的话）

### 202. 快乐数
#### 题目：https://leetcode.cn/problems/happy-number/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/hash-table/202-happy-number.md)

这题同样要用到上一题的哈希法，利用 `map` 来模拟集合，从而实现对于已经出现数的检测，具体思路如下：

* 首先初始化一个 `visited` 集合，方法是一样的，集合用来存放已经出现过的数字
* 用一个循环实现快乐数的遍历过程，条件是 `n != 1`，因为是以 `n` 为条件，所以主要的逻辑都写在循环内部
  * 首先**检测当前 `n` 是否已经在 `visited` 里出现过**，这里也是用到上一题的判断方式，考察对于 `map` 的键值对的基本操作，通过 `_, seen := visited[n]; seen` 实现，`seen` 这里是布尔类型
  * 然后将键存入集合中，值也是一样用空结构体即可 `{}{}`
  * 声明两个新变量，**`sum` 用来记录新数的和**，将 `n` 赋给 `t` 用来操作当前的整数
  * 进入一个新循环，当 `t > 0` 时，拆分当前整数并累加
    * **对 `t` 取 10 的模能得到最后一位数字 `t % 10`**，用另一个新变量 `d` 接收，平方后再赋给 `sum`
    * **对 `t` 除 10 能去除其最后一位数字 `t /= 10`**
  * 最后将 `sum` 赋给 `n` 即可，循环外正常返回 `true`

注意事项：

* 别忘了初始化集合，也别忘了给集合的键值赋值
* 对于如何拆分整数的操作要熟悉

### 1. 两数之和
#### 题目：https://leetcode.cn/problems/two-sum/description/

[我的解答](https://github.com/EthanQC/my-learning-record/blob/main/data-structure-and-algorithm/problems-record/hash-table/1-two-sum.md)

