### 二分查找
二分查找是一种搜索算法（我不太确定能不能这样叫，但确实是用来搜索的），基本想法如下：
- 找到一组有序（一般为**升序**）数据的中位数，跟目标数比对
  * 如果中位数比目标数**大**：说明目标数**在左半边更小的那一半**数据中，于是**舍弃右半边**，找到左半边数据的中位数，**重复**跟目标数比对
  * 如果中位数比目标数**小**：同理，**舍弃左半边**，找到右半边数据的中位数，**重复**跟目标数比对
- 重复上面的过程，直到找到目标数为止

二分查找的效率很高，每次迭代能将范围缩小一半，其**时间复杂度**一般为**O(log n)**，**空间复杂度**一般为**O(1)**