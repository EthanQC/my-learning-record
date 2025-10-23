---
title: 347 top k frequent elements
date: '2025-09-03'
tags:
  - stack-and-queue
summary: 'for _, v := range nums { freq[v]++ }'
---
## 347. 前 K 个高频元素
### go：
```go
func topKFrequent(nums []int, k int) []int {
    freq := make(map[int]int)
    buckets := make([][]int, len(nums) + 1)
    results := make([]int, 0, k)

    for _, v := range nums {
        freq[v]++
    }

    for v, counts := range freq {
        buckets[counts] = append(buckets[counts], v)
    }

    for i := len(buckets) - 1; i > 0 && len(results) < k; i-- {
        for _, nums := range buckets[i] {
            results = append(results, nums)
        }
    }

    return results
}
```
