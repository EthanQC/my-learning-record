## 309. 买卖股票的最佳时机含冷冻期
### go：
```go
func maxProfit(prices []int) int {
    n := len(prices)
    if n == 0 {
        return 0
    }

    hold, sold, rest := -prices[0], -prices[0], 0

    for i := 1; i < n; i++ {
        newHold, newSold := hold, hold + prices[i]
        if newHold < rest - prices[i] {
            newHold = rest - prices[i]
        }
        
        newRest := rest
        if newRest < sold {
            newRest = sold
        }

        hold, sold, rest = newHold, newSold, newRest
    }

    if sold > rest {
        return sold
    }
    return rest
}
```