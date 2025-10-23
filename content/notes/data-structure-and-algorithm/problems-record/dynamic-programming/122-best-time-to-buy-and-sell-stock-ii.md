---
title: 122 best time to buy and sell stock ii
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 1; i < len(prices); i++ { preCash, preHold := cash, hold cash =
  max(preCash, preHold + prices[i]) hold = max(preHold, preCash - prices[i]) }
---
## 122. 买卖股票的最佳时机 II
### go：
```go
func maxProfit(prices []int) int {
    if len(prices) == 0 {
        return 0
    }
    cash, hold := 0, -prices[0]

    for i := 1; i < len(prices); i++ {
        preCash, preHold := cash, hold
        cash = max(preCash, preHold + prices[i])
        hold = max(preHold, preCash - prices[i])
    }

    return cash
}

func max(a, b int) int {
    if a < b {
        return b
    }
    return a
}
```
