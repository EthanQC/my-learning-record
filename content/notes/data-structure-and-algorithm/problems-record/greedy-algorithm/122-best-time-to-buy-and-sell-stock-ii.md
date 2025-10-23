---
title: 122 best time to buy and sell stock ii
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: 'return earn } ```'
---
## 122. 买卖股票的最佳时机 II
### go：
```go
func maxProfit(prices []int) int {
    earn := 0
    for i := 1; i < len(prices); i++ {
        diff := prices[i] - prices[i - 1]
        if diff > 0 {
            earn += diff
        }
    }

    return earn
}
```
