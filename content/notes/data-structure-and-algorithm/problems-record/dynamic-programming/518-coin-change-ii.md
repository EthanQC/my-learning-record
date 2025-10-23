## 518. 零钱兑换 II
### go：
```go
func change(amount int, coins []int) int {
    dp := make([]int, amount + 1)
    dp[0] = 1

    for _, c := range coins {
        for j := c; j <= amount; j++{
            dp[j] += dp[j - c]
        }
    }

    return dp[amount]
}
```