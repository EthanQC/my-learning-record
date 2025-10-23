---
title: 674 longest continuous increasing subsequence
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'return ans } ```'
---
## 674. 最长连续递增序列
### go：
```go
func findLengthOfLCIS(nums []int) int {
    count, pre := 1, nums[0]
    ans := 1
    for _, v := range nums {
        if pre < v {
            count++
        } else  {
            count = 1
        }
        
        if ans < count {
            ans = count
        }
        pre = v
    }

    return ans
}
```
