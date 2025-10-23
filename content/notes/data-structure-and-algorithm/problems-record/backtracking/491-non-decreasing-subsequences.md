---
title: 491 non decreasing subsequences
date: '2025-09-03'
tags:
  - backtracking
summary: >-
  func backtrack(nums, path []int, res *[][]int, start int) { if len(path) >= 2
  { temp := make([]int, len(path)) copy(temp, path) *res = append(*res, temp) }
---
## 491. 非递减子序列
### go：
```go
func findSubsequences(nums []int) [][]int {
    var res [][]int
    var path []int
    backtrack(nums, path, &res, 0)
    return res
}

func backtrack(nums, path []int, res *[][]int, start int) {
    if len(path) >= 2 {
        temp := make([]int, len(path))
        copy(temp, path)
        *res = append(*res, temp)
    }

    used := make(map[int]bool)
    for i := start; i < len(nums); i++ {
        if used[nums[i]] {
            continue
        }
        if len(path) > 0 && nums[i] < path[len(path) - 1] {
            continue
        }
        used[nums[i]] = true

        path = append(path, nums[i])
        backtrack(nums, path, res, i + 1)
        path = path[: len(path) - 1]
    }
}
```
