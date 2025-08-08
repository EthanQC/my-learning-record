## 188. 买卖股票的最佳时机 IV
### go：
```go
func maxProfit(k int, prices []int) int {
    n := len(prices)
    if n == 0 || k == 0 {
        return 0
    }

    if k >= n / 2 {
        ans := 0
        for i := 1; i < n; i++{
            diff := prices[i] - prices[i - 1]
            if diff > 0 {
                ans += diff
            }
        }
        return ans
    }

    buy := make([]int, k + 1)
    sell := make([]int, k + 1)
    for i := 0; i <= k; i++ {
        buy[i] = -prices[0]
    }

    for i := 1; i < n; i++ {
        for j := k; j > 0; j-- {
            if buy[j] < sell[j - 1] -prices[i] {
                buy[j] = sell[j - 1] - prices[i]
            }
            if sell[j] < buy[j] + prices[i] {
                sell[j] = buy[j] + prices[i]
            }
        }
    }

    return sell[k]
}
```