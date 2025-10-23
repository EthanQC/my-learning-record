---
title: 279 perfect squares
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 1; i <= n; i++ { for j := 1; j * j <= i; j++ { if dp[i] > dp[i - j *
  j] + 1 { dp[i] = dp[i - j * j] + 1 } } }
---
## 279. 完全平方数
### go：
```go
func numSquares(n int) int {
    dp := make([]int, n + 1)
    dp[0] = 0
    for i := 1; i <= n; i++ {
        dp[i] = n + 1
    }

    for i := 1; i <= n; i++ {
        for j := 1; j * j <= i; j++ {
            if dp[i] > dp[i - j * j] + 1 {
                dp[i] = dp[i - j * j] + 1
            }
        }
    }

    return dp[n]
}
```
