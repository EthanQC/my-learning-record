---
title: 39 combination sum
date: '2025-09-03'
tags:
  - backtracking
summary: >-
  func combinationSum(candidates []int, target int) [][]int {
  sort.Ints(candidates)
---
## 39. 组合总和
### go：
```go
import "sort"

func combinationSum(candidates []int, target int) [][]int {
    sort.Ints(candidates)

    var results [][]int
    var path []int
    backtrack(candidates, &results, path, 0, 0, target)

    return results
}

func backtrack(candidates []int, results *[][]int, path []int, start, sum, target int) {
    if sum > target {
        return
    }
    if sum == target {
        temp := make([]int, len(path))
        copy(temp, path)
        *results = append(*results, temp)
    }

    for i := start; i < len(candidates); i++ {
        if sum + candidates[i] > target {
            return
        }

        path = append(path, candidates[i])
        sum += candidates[i]

        backtrack(candidates, results, path, i, sum, target)

        path = path[: len(path) - 1]
        sum -= candidates[i]
    }
}
```
