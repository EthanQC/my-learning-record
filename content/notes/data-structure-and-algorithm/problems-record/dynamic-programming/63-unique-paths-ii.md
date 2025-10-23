---
title: 63 unique paths ii
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 1; i < m; i++ { if obstacleGrid[i][0] == 0 && dp[i - 1][0] == 1 {
  dp[i][0] = 1 } } for j := 1; j < n; j++ { if obstacleGrid[0][j] == 0 &&
  dp[0][j - 1] == 1{ dp[0][j] = 1 }
---
## 63. 不同路径 II
### go：
```go
func uniquePathsWithObstacles(obstacleGrid [][]int) int {
    m, n := len(obstacleGrid), len(obstacleGrid[0])
    dp := make([][]int, m)
    for i := range dp {
        dp[i] = make([]int, n)
    }
    if obstacleGrid[0][0] == 0 {
        dp[0][0] = 1
    }

    for i := 1; i < m; i++ {
        if obstacleGrid[i][0] == 0 && dp[i - 1][0] == 1 {
            dp[i][0] = 1
        }
    }
    for j := 1; j < n; j++ {
        if obstacleGrid[0][j] == 0 && dp[0][j - 1] == 1{
            dp[0][j] = 1
        }
    }

    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            if obstacleGrid[i][j] == 0 {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
            }
        }
    }

    return dp[m - 1][n - 1]
}
```
