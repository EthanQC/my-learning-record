## 93. 复原 IP 地址
### go：
```go
import (
    "strings"
    "strconv"
)

func restoreIpAddresses(s string) []string {
    var results []string
    var path []string
    backtrack(&results, path, 0, s)
    return results
}

func backtrack(results *[]string, path []string, start int, s string) {
    if len(path) == 4 {
        if start == len(s) {
            *results = append(*results, strings.Join(path, "."))
        }
        return
    }

    for i := 1; i < 4; i++ {
        if i + start > len(s) {
            break
        }
        seg := s[start : start + i]
        if seg[0] == '0' && len(seg) > 1 {
            continue
        }

        val, _ := strconv.Atoi(seg)
        if val > 255 {
            continue
        }

        path = append(path, seg)
        backtrack(results, path, start + i, s)
        path = path[: len(path) - 1]
    }
}
```