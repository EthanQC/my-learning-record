---
title: 714 best time to buy and sell stock with transaction fee
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  cash, hold := 0, -prices[0] for i := 1; i < n; i++{ newCash, newHold := cash,
  hold
---
## 714. 买卖股票的最佳时机含手续费
### go：
```go
func maxProfit(prices []int, fee int) int {
    n := len(prices)
    if n == 0 {
        return 0
    }

    cash, hold := 0, -prices[0]
    for i := 1; i < n; i++{
        newCash, newHold := cash, hold

        if newCash < hold + prices[i] - fee {
            newCash = hold + prices[i] - fee
        }
        if newHold < cash -prices[i] {
            newHold = cash -prices[i]
        }

        cash, hold = newCash, newHold
    }

    return cash
}
```
