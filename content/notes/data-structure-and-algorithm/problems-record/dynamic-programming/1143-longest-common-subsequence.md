## 1143. 最长公共子序列
### go：
```go
func longestCommonSubsequence(text1 string, text2 string) int {
    n, m := len(text1), len(text2)
    dp := make([]int, m + 1)

    for i := 1; i <= n; i++ {
        pre := 0

        for j := 1; j <= m; j++ {
            temp := dp[j]

            if text1[i - 1] == text2[j - 1] {
                dp[j] = pre + 1
            } else if dp[j - 1] > dp[j] {
                dp[j] = dp[j - 1]
            }

            pre = temp
        }
    }

    return dp[m]
}
```