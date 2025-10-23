---
title: 343 integer break
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 2; i <= n; i++ { max := 0 for j := 1; j < i; j++ { if max < j * (i -
  j) { max = j * (i - j) } if max < j * dp[i - j] { max = j * dp[i - j] } }
  dp[i] = max }
---
## 343. 整数拆分
### go：
```go
func integerBreak(n int) int {
    dp := make([]int, n + 1)
    dp[0], dp[1] = 0, 0

    for i := 2; i <= n; i++ {
        max := 0
        for j := 1; j < i; j++ {
            if max < j * (i - j) {
                max = j * (i - j)
            }
            if max < j * dp[i - j] {
                max = j * dp[i - j]
            }
        }
        dp[i] = max
    }

    return dp[n]
}
```
