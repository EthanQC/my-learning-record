---
title: 139 word break
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 1; i <= n; i++ { for _, w := range wordDict { lw := len(w) if i >= lw
  && dp[i - lw] && s[i - lw : i] == w { dp[i] = true } } }
---
## 139. 单词拆分
### go：
```go
func wordBreak(s string, wordDict []string) bool {
    n := len(s)
    dp := make([]bool, n + 1)
    dp[0] = true

    for i := 1; i <= n; i++ {
        for _, w := range wordDict {
            lw := len(w)
            if i >= lw && dp[i - lw] && s[i - lw : i] == w {
                dp[i] = true
            }
        }
    }

    return dp[n]
}
```
