## 202. 快乐数
### go：

```go
func isHappy(n int) bool {
    visited := make(map[int]struct{})

    for n != 1 {
        if _, seen := visited[n]; seen {
            return false
        }

        visited[n] = struct{}{}

        sum := 0
        t := n

        for t > 0 {
            d := t % 10
            sum += d * d
            t /= 10
        }

        n = sum
    }

    return true
}
```