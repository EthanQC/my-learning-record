---
title: 435 non overlapping intervals
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: >-
  func eraseOverlapIntervals(intervals [][]int) int { if len(intervals) == 0 {
  return 0 }
---
## 435. 无重叠区间
### go：
```go
import "sort"

func eraseOverlapIntervals(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }

    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    count, pos := 0, intervals[0][1]
    for i := 1; i < len(intervals); i++ {
        if pos > intervals[i][0] {
            count++
        } else {
            pos = intervals[i][1]
        }
    }

    return count
}
```
