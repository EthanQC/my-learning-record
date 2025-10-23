## 28. 找出字符串中第一个匹配项的下标
### go：
```go
func strStr(haystack string, needle string) int {
    n, m := len(haystack), len(needle)

    if m == 0 {
        return 0
    }
    if n < m {
        return -1
    }

    next := make([]int, m)
    next[0] = 0
    length := 0

    for i := 1; i < m; {
        if needle[i] == needle[length] {
            length++
            next[i] = length
            i++            
        } else {
            if length > 0 {
                length = next[length - 1]
            } else {
                next[i] = 0
                i++
            }
        }
    }

    i, j := 0, 0

    for i < n {
        if haystack[i] == needle[j] {
            i++
            j++
            
            if j == m {
                return i - j
            }
        } else {
            if j > 0 {
                j = next[j - 1]
            } else {
                i++
            }
        }
    }

    return -1
}
```