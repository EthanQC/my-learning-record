## 459. 重复的子字符串
### go：
```go
func repeatedSubstringPattern(s string) bool {
    length := len(s)

    if length < 2 {
        return false
    }

    next := make([]int, length)

    for i, j := 1, 0; i < length; i++ {
        for j > 0 && s[i] != s[j] {
            j = next[j - 1]
        }

        if s[i] == s[j] {
            j++
        }

        next[i] = j
    }

    maxLSP := next[length - 1]

    return maxLSP > 0 && length % (length - maxLSP) == 0
}
```