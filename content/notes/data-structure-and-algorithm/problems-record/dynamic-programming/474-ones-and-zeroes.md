---
title: 474 ones and zeroes
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for _, s := range strs { zeros, ones := 0, 0 for _, ch := range s{ if ch ==
  '0' { zeros++ } else { ones++ } }
---
## 474. 一和零
### go：
```go
func findMaxForm(strs []string, m int, n int) int {
    dp := make([][]int, m + 1)
    for i := range dp {
        dp[i] = make([]int, n + 1)
    }

    for _, s := range strs {
        zeros, ones := 0, 0
        for _, ch := range s{
            if ch == '0' {
                zeros++
            } else {
                ones++
            }
        }

        for i := m; i >= zeros; i-- {
            for j := n; j >= ones; j-- {
                if dp[i - zeros][j - ones] + 1 > dp[i][j] {
                    dp[i][j] = dp[i - zeros][j - ones] + 1
                }
            }
        }
    }

    return dp[m][n]
}
```
