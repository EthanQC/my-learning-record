---
title: 135 candy
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: >-
  sum, right := 0, 1 for i := n - 1; i >= 0; i-- { if i < n - 1 && ratings[i] >
  ratings[i + 1] { right++ } else { right = 1 }
---
## 135. 分发糖果
### go：
```go
func candy(ratings []int) int {
    n := len(ratings)
    if n == 0 {
        return 0
    }
    
    left := make([]int, n)
    for i := range ratings {
        left[i] = 1
    }
    for i := 0; i < n; i++ {
        if i > 0 && ratings[i] > ratings[i - 1] {
            left[i] = left[i - 1] + 1
        }
    }

    sum, right := 0, 1
    for i := n - 1; i >= 0; i-- {
        if i < n - 1 && ratings[i] > ratings[i + 1] {
            right++
        } else {
            right = 1
        }

        if left[i] > right {
            sum += left[i]
        } else {
            sum += right
        }
    }
    return sum
}
```
