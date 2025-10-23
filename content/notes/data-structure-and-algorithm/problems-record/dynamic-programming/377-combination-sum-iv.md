---
title: 377 combination sum iv
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for j := 1; j <= target; j++ { for _, n := range nums { if j >= n { dp[j] +=
  dp[j - n] } } }
---
## 377. 组合总和 Ⅳ
### go：
```go
func combinationSum4(nums []int, target int) int {
    dp := make([]int, target + 1)
    dp[0] = 1

    for j := 1; j <= target; j++ {
        for _, n := range nums {
            if j >= n {
                dp[j] += dp[j - n]
            }
        }
    }

    return dp[target]
}
```
