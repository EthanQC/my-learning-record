---
title: 131 palindrome partitioning
date: '2025-09-03'
tags:
  - backtracking
summary: >-
  func backtrack(s string, results *[][]string, path []string, start int) { if
  start == len(s) { temp := make([]string, len(path)) copy(temp, path) *results
  = append(*results, temp)
---
## 131. 分割回文串
### go：
```go
func partition(s string) [][]string {
    var results [][]string
    var path []string
    backtrack(s, &results, path, 0)
    return results
}

func backtrack(s string, results *[][]string, path []string, start int) {
    if start == len(s) {
        temp := make([]string, len(path))
        copy(temp, path)
        *results = append(*results, temp)
    }

    for i := start; i < len(s); i++ {
        if !isPal(s, start, i) {
            continue
        }

        path = append(path, s[start : i + 1])
        backtrack(s, results, path, i + 1)
        path = path[: len(path) - 1]
    }
}

func isPal(s string, l, r int) bool {
    for l < r {
        if s[l] != s[r] {
            return false
        }

        l++
        r--
    }

    return true
}
```
