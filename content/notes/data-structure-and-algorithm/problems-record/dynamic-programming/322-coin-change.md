---
title: 322 coin change
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for _, c := range coins { for j := c; j <= amount; j++ { if dp[j] > dp[j - c]
  + 1 { dp[j] = dp[j - c] + 1 } } }
---
## 322. 零钱兑换
### go：
```go
func coinChange(coins []int, amount int) int {
    dp := make([]int, amount + 1)
    dp[0] = 0
    for i := 1; i <= amount; i++ {
        dp[i] = amount + 1
    }

    for _, c := range coins {
        for j := c; j <= amount; j++ {
            if dp[j] > dp[j - c] + 1 {
                dp[j] = dp[j - c] + 1
            }
        }
    }

    if dp[amount] == amount + 1 {
        return -1
    }
    return dp[amount]
}
```
