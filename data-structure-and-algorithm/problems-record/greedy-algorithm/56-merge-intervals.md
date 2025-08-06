## 56. 合并区间
### go：
```go
import "sort"

func merge(intervals [][]int) [][]int {
    if len(intervals) == 1 {
        return intervals
    }

    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    start, end := intervals[0][0], intervals[0][1]
    res := make([][]int, 0, len(intervals))
    for i := 1; i < len(intervals); i++ {
        if end >= intervals[i][0] {
            if end < intervals[i][1] {
                end = intervals[i][1]
            }
        } else {
            res = append(res, []int{start, end})
            start, end = intervals[i][0], intervals[i][1]
        }
    }
    res = append(res, []int{start, end})

    return res
}
```