## 435. 无重叠区间
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