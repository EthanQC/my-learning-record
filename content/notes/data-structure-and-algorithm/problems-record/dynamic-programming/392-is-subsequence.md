## 53. 最大子数组和
### go：
```go
func isSubsequence(s string, t string) bool {
    i := 0
    for j := 0; j < len(t) && i < len(s); j++ {
        if t[j] == s[i] {
            i++
        }
    }

    return i == len(s)
}
```