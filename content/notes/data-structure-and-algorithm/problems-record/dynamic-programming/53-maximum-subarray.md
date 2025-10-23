---
title: 53 maximum subarray
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'if currSum > maxSum { maxSum = currSum } } return maxSum } ```'
---
## 53. 最大子数组和
### go：
```go
func maxSubArray(nums []int) int {
    currSum, maxSum := nums[0], nums[0]
    for i := 1; i < len(nums); i++ {
        if currSum < 0 {
            currSum = nums[i]
        } else {
            currSum += nums[i]
        }

        if currSum > maxSum {
            maxSum = currSum
        }
    }
    
    return maxSum
}
```
