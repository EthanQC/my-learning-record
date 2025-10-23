## 123. 买卖股票的最佳时机 III
### go：
```go
func maxProfit(prices []int) int {
    if len(prices) == 0 {
        return 0
    }

    buy1, sell1 := -prices[0], 0
    buy2, sell2 := -prices[0], 0

    for i := 1; i < len(prices); i++{
        if buy1 < -prices[i] {
            buy1 = -prices[i]
        }
        if sell1 < buy1 + prices[i] {
            sell1 = buy1 + prices[i]
        }
        if buy2 < sell1 - prices[i] {
            buy2 = sell1 - prices[i]
        }
        if sell2 < buy2 + prices[i] {
            sell2 = buy2 + prices[i]
        }
    }

    return sell2
}
```