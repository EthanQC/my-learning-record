---
title: 503 next greater element ii
date: '2025-09-03'
tags:
  - monotonic-stack
summary: 'for i := 0; i < n; i++ { ans[i] = -1 }'
---
## 503. 下一个更大元素 II
### go：
```go
func nextGreaterElements(nums []int) []int {
    n := len(nums)
    stack, ans := make([]int, n), make([]int, n)

    for i := 0; i < n; i++ {
        ans[i] = -1
    }

    for i := 0; i < 2 * n; i++ {
        cur := nums[i % n]
        for len(stack) > 0 && cur > nums[stack[len(stack) - 1]] {
            v := stack[len(stack) - 1]
            stack = stack[: len(stack) - 1]
            ans[v] = cur
        }

        if i < n {
            stack = append(stack, i)
        }
    }

    return ans
}
```
