---
title: 96 unique binary search trees
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 2; i <= n; i++ { total := 0 for j := 1; j <= i; j++ { total += dp[j -
  1] * dp[i - j] } dp[i] = total }
---
## 96. 不同的二叉搜索树
### go：
```go
func numTrees(n int) int {
    dp := make([]int, n + 1)
    dp[0], dp[1] = 1, 1

    for i := 2; i <= n; i++ {
        total := 0
        
        for j := 1; j <= i; j++ {
            total += dp[j - 1] * dp[i - j]
        }
        dp[i] = total
    }

    return dp[n]
}
```
