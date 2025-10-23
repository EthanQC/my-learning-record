---
title: 42 trapping rain water
date: '2025-09-03'
tags:
  - monotonic-stack
summary: 'l, r := 0, n - 1 lM, rM := 0, 0 water := 0'
---
## 42. 接雨水
### go：
双指针法：
```go
func trap(height []int) int {
    n := len(height)
    if n <= 2 {
        return 0
    }

    l, r := 0, n - 1
    lM, rM := 0, 0
    water := 0

    for l < r {
        if height[l] < height[r] {
            if height[l] >= lM {
                lM = height[l]
            } else {
                water += lM - height[l]
            }

            l++
        } else {
            if height[r] >= rM {
                rM = height[r]
            } else {
                water += rM - height[r]
            }

            r--
        }
    }

    return water
}
```
