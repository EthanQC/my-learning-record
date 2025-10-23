---
title: 213 house robber ii
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'a, b := r(nums[1 :]), r(nums[: n - 1]) if a > b { return a } return b }'
---
## 213. 打家劫舍 II
### go：
```go
func rob(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }
    if n == 1 {
        return nums[0]
    }

    a, b := r(nums[1 :]), r(nums[: n - 1])
    if a > b {
        return a
    }
    return b
}

func r(nums []int) int {
    pre1, pre2 := 0, 0
    for _, v := range nums {
        cur := pre1
        if cur < pre2 + v {
            cur = pre2 + v
        }

        pre1, pre2 = cur, pre1
    }

    return pre1
}
```
