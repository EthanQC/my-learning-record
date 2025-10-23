---
title: 239 sliding window maximum
date: '2025-09-03'
tags:
  - stack-and-queue
summary: 'dq := make([]int, 0, k) results := make([]int, 0, length - k + 1)'
---
## 239. 滑动窗口最大值
### go：
```go
func maxSlidingWindow(nums []int, k int) []int {
    length := len(nums)
    if length == 0 || k == 0 {
        return nil
    }

    dq := make([]int, 0, k)
    results := make([]int, 0, length - k + 1)

    for i := 0; i < length; i++ {
        if len(dq) > 0 && dq[0] < i - k + 1 {
            dq = dq[1 :]
        }

        for len(dq) > 0 && nums[dq[len(dq) - 1]] < nums[i] {
            dq = dq[: len(dq) - 1]
        }

        dq = append(dq, i)

        if i >= k - 1 {
            results = append(results, nums[dq[0]])
        }
    }

    return results
}
```
