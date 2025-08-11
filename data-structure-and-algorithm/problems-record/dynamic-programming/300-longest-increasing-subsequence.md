## 300. 最长递增子序列
### go：
动态规划：
```go
func lengthOfLIS(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }

    dp, ans := make([]int, n), 0

    for i := 0; i < n; i++{
        dp[i] = 1
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j] + 1 > dp[i] {
                dp[i] = dp[j] + 1
            }
        }

        if dp[i] > ans {
            ans = dp[i]
        }
    }

    return ans
}
```

贪心 + 二分（更优时间复杂度）：
```go
import "sort"

func lengthOfLIS(nums []int) int {
    tails := make([]int, 0, len(nums))

    for _, x := range nums {
        i := sort.SearchInts(tails, x)

        if i == len(tails) {
            tails = append(tails, x)
        } else {
            tails[i] = x
        }
    }

    return len(tails)
}
```