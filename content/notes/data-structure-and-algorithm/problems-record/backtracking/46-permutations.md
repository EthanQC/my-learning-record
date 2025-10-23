---
title: 46 permutations
date: '2025-09-03'
tags:
  - backtracking
summary: >-
  func backtrack(nums, path []int, res *[][]int, used []bool) { if len(path) ==
  len(nums) { temp := make([]int, len(path)) copy(temp, path) *res =
  append(*res, temp) }
---
## 46. 全排列
### go：
```go
func permute(nums []int) [][]int {
    var res [][]int
    var path []int
    used := make([]bool, len(nums))
    backtrack(nums, path, &res, used)
    return res
}

func backtrack(nums, path []int, res *[][]int, used []bool) {
    if len(path) == len(nums) {
        temp := make([]int, len(path))
        copy(temp, path)
        *res = append(*res, temp)
    }

    for i := 0; i < len(nums); i++ {
        if used[i] {
            continue
        }

        used[i] = true
        path = append(path, nums[i])
        backtrack(nums, path, res, used)
        used[i] = false
        path = path[: len(path) - 1]
    }
}
```
