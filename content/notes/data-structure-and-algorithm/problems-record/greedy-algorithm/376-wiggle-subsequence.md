## 376. 摆动序列
### go：
```go
func wiggleMaxLength(nums []int) int {
    if len(nums) < 2 {
        return len(nums)
    }

    count, prediff := 1, 0
    for i := 1; i < len(nums); i++ {
        diff := nums[i] - nums[i - 1]
        if (diff > 0 && prediff <= 0) || (diff < 0 && prediff >= 0) {
            count++
            prediff = diff
        }
    }

    return count
}
```