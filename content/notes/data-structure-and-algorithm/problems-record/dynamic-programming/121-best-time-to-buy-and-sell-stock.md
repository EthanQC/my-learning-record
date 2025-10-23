---
title: 121 best time to buy and sell stock
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 1; i < len(prices); i++ { if profit < prices[i] - minPrice { profit =
  prices[i] - minPrice }
---
## 121. 买卖股票的最佳时机
### go：
```go
func maxProfit(prices []int) int {
    if len(prices) == 0 {
        return 0
    }
    minPrice, profit := prices[0], 0

    for i := 1; i < len(prices); i++ {
        if profit < prices[i] - minPrice {
            profit = prices[i] - minPrice
        }

        if prices[i] < minPrice {
            minPrice = prices[i]
        }
    }

    return profit
}
```
