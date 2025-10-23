---
title: 198 house robber
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'return pre1 } ```'
---
## 198. 打家劫舍
### go：
空间优化：
```go
func rob(nums []int) int {
    pre1, pre2 := 0, 0
    for _, v := range nums {
        cur := pre1
        if cur < pre2 + v {
            cur = pre2 + v
        }
        pre1, pre2 = cur, pre1
    }

    return pre1
}
```

正常动态规划：
```go
func rob(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }
    if n == 1 {
        return nums[0]
    }

    dp := make([]int, n + 1)
    dp[0], dp[1] = 0, nums[0]
    for i := 2; i <= n; i++ {
        if dp[i - 1] > dp[i - 2] + nums[i - 1] {
            dp[i] = dp[i - 1]
        } else {
            dp[i] = dp[i - 2] + nums[i - 1]
        }
    }

    return dp[n]
}
```
