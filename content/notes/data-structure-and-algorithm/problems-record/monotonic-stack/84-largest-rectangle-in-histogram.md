## 84. 柱状图中最大的矩形
### go：
```go
func largestRectangleArea(heights []int) int {
    n := len(heights)
    hh := make([]int, n + 2)
    hh = append(hh, 0)
    hh = append(hh, heights...)
    hh = append(hh, 0)

    st := []int{}
    max := 0

    for i := 0; i < len(hh); i++ {
        for len(st) > 0 && hh[i] < hh[st[len(st) - 1]] {
            mid := st[len(st) - 1]
            st = st[: len(st) - 1]
            left := st[len(st) - 1]
            width := i - left - 1
            area := hh[mid] * width

            if area > max {
                max = area
            }
        }

        st = append(st, i)
    }

    return max
}
```