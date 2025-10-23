---
title: 90 subsets ii
date: '2025-09-03'
tags:
  - backtracking
summary: >-
  func subsetsWithDup(nums []int) [][]int { var res [][]int var path []int
  sort.Ints(nums) backtrack(nums, path, &res, 0) return res }
---
## 90. 子集 II
### go：
```go
import "sort"

func subsetsWithDup(nums []int) [][]int {
    var res [][]int
    var path []int
    sort.Ints(nums)
    backtrack(nums, path, &res, 0)
    return res
}

func backtrack(nums, path []int, res *[][]int, start int) {
    temp := make([]int, len(path))
    copy(temp, path)
    *res = append(*res, temp)

    for i := start; i < len(nums); i++ {
        if i > start && nums[i] == nums[i - 1] {
            continue
        }
        
        path = append(path, nums[i])
        backtrack(nums, path, res, i + 1)
        path = path[: len(path) - 1]
    }
}
```
