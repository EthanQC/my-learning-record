---
title: 416 partition equal subset sum
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'dp := make([]bool, target + 1) dp[0] = true'
---
## 416. 分割等和子集
### go：
```go
func canPartition(nums []int) bool {
    sum := 0
    for _, v := range nums {
        sum += v
    }
    
    if (sum % 2) == 1 {
        return false
    }
    target := sum / 2

    dp := make([]bool, target + 1)
    dp[0] = true

    for _, n := range nums {
        if n > target {
            continue
        }
        
        for j := target; j >= n; j-- {
            if dp[j - n] {
                dp[j] = true
            }
        }
    }

    return dp[target]
}
```
