## 1005. K 次取反后最大化的数组和
### go：
```go
import "sort"

func largestSumAfterKNegations(nums []int, k int) int {
    sort.Ints(nums)
    for i := 0; i < len(nums) && nums[i] < 0 && k > 0; i++ {
        nums[i] = -nums[i]
        k--
    }
    sort.Ints(nums)
    sum := 0
    if k % 2 == 1 {
        nums[0] = -nums[0]
    }
    for _, v := range nums {
        sum += v
    }

    return sum
}
```