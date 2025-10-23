---
title: 509 fibonacci number
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'a, b := 0, 1 for i := 2; i <= n; i++ { a, b = b, a + b } return b } ```'
---
## 509. 斐波那契数
### go：
空间优化：
```go
func fib(n int) int {
    if n < 2 {
        return n
    }

    a, b := 0, 1
    for i := 2; i <= n; i++ {
        a, b = b, a + b
    }
    return b
}
```

常规流程：
```go
func fib(n int) int {
    if n < 2 {
        return n
    }
    // dp[i] 就代表 F(i)
    dp := make([]int, n+1)
    dp[0], dp[1] = 0, 1
    for i := 2; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]  // 状态转移方程
    }
    return dp[n]
}```
