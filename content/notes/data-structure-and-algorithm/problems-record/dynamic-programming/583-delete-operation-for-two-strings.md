---
title: 583 delete operation for two strings
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'for i := 1; i <= n; i++ { pre := 0'
---
## 583. 两个字符串的删除操作
### go：
```go
func minDistance(word1 string, word2 string) int {
    n, m := len(word1), len(word2)
    dp := make([]int, m + 1)

    for i := 1; i <= n; i++ {
        pre := 0

        for j := 1; j <= m; j++ {
            temp := dp[j]

            if word1[i - 1] == word2[j - 1] {
                dp[j] = pre + 1
            } else if dp[j - 1] > dp[j] {
                dp[j] = dp[j - 1]
            }

            pre = temp
        }
    }

    return n + m - 2 * dp[m]
}
```
