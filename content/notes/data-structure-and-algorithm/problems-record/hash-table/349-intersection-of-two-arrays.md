---
title: 349 intersection of two arrays
date: '2025-09-03'
tags:
  - hash-table
summary: >-
  ```go func intersection(nums1 []int, nums2 []int) []int { if len(nums1) >
  len(nums2) { return intersection(nums2, nums1) }
---
## 349. 两个数组的交集
### go：

```go
func intersection(nums1 []int, nums2 []int) []int {
    if len(nums1) > len(nums2) {
        return intersection(nums2, nums1)
    }

    set1 := make(map[int]struct{}, len(nums1))

    for _, v := range nums1 {
        set1[v] = struct{}{}
    }

    resultSet := make(map[int]struct{})

    for _, v := range nums2 {
        if _, ok := set1[v]; ok {
            resultSet[v] = struct{}{}
        }
    }

    res := make([]int, 0, len(resultSet))

    for v := range resultSet {
        res = append(res, v)
    }

    return res
}
```
