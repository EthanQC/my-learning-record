---
title: 455 assign cookies
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: 'func findContentChildren(g []int, s []int) int { sort.Ints(g) sort.Ints(s)'
---
## 455. 分发饼干
### go：
```go
import "sort"

func findContentChildren(g []int, s []int) int {
    sort.Ints(g)
    sort.Ints(s)

    count, index := 0, len(s) - 1
    for i := len(g) - 1; i >= 0; i-- {
        if index >= 0 && g[i] <= s[index] {
            count++
            index--
        }
    }

    return count
}
```
