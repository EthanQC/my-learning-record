---
title: 452 minimum number of arrows to burst balloons
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: 'func findMinArrowShots(points [][]int) int { if len(points) == 0 { return 0 }'
---
## 452. 用最少数量的箭引爆气球
### go：
```go
import "sort"

func findMinArrowShots(points [][]int) int {
    if len(points) == 0 {
        return 0
    }

    sort.Slice(points, func(i, j int) bool {
        return points[i][1] < points[j][1]
    })

    count, arrPos := 1, points[0][1]
    for i := 1; i < len(points); i++ {
        if points[i][0] > arrPos {
            count++
            arrPos = points[i][1]
        }
    }

    return count
}
```
