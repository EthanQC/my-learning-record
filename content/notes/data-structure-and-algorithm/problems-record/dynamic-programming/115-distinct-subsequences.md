## 115. 不同的子序列
### go：
```go
func numDistinct(s string, t string) int {
    m := len(t)
    dp := make([]int, m + 1)
    dp[0] = 1

    for i := 0; i < len(s); i++ {
        for j := m; j >= 1; j-- {
            if s[i] == t[j - 1] {
                dp[j] += dp[j - 1]
            }
        }
    }

    return dp[m]
}
```