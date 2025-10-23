---
title: 55 jump game
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: ''
---
## 55. 跳跃游戏
### go：
```go
func canJump(nums []int) bool {
    r := 0
    for i, v := range nums {
        if r < i {
            return false
        }
        if i + v > r {
            r = i + v
        }
        if r > len(nums) - 1 {
            return true
        }
    }
    return true
}
```
