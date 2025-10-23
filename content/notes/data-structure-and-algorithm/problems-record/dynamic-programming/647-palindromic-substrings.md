## 647. 回文子串
### go：
```go
func longestPalindromeSubseq(s string) int {
    n := len(s)
    t := make([]byte, n)

    for i := 0; i < n; i++ {
        t[i] = s[n - 1 - i]
    }

    dp := make([]int, n + 1)
    for i := 1; i <= n; i++ {
        pre := 0

        for j := 1; j <= n; j++ {
            tmp := dp[j]

            if s[i - 1] == t[j - 1] {
                dp[j] = pre + 1
            } else if dp[j - 1] > dp[j] {
                dp[j] = dp[j - 1]
            }

            pre = tmp
        }
    }

    return dp[n]
}
```