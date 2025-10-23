---
title: 77 combinations
date: '2025-09-03'
tags:
  - backtracking
summary: 'return results }'
---
## 77. 组合
### go：
```go
func combine(n int, k int) [][]int {
    var results [][]int
    var path []int
    backtrack(&results, path, 1, n, k)

    return results
}

func backtrack(results *[][]int, path []int, start, n, k int) {
    if len(path) == k {
        temp := make([]int, k)
        copy(temp, path)
        *results = append(*results, temp)
        return
    }

    for i := start; i <= n; i++ {
        if len(path) + n - i + 1 < k {
            break
        }

        path = append(path, i)
        backtrack(results, path, i + 1, n, k)
        path = path[: len(path) - 1]
    }
}
```

剪枝优化
```go
func combine(n int, k int) [][]int {
    var results [][]int
    var path []int
    backtrack(&results, path, 1, n, k)

    return results
}

func backtrack(results *[][]int, path []int, start, n, k int) {
    if len(path) == k {
        temp := make([]int, k)
        copy(temp, path)
        *results = append(*results, temp)
        return
    }

    for i := start; i <= n - (k - len(path)) + 1; i++ {
        path = append(path, i)
        backtrack(results, path, i + 1, n, k)
        path = path[: len(path) - 1]
    }
}
```
