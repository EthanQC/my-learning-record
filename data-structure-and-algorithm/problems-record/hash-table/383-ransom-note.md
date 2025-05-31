## 383. 赎金信
### go：

```go
func canConstruct(ransomNote string, magazine string) bool {
    if len(magazine) < len(ransomNote) {
        return false
    }

    counts := make([]int, 26)

    for _, ch := range magazine {
        counts[ch - 'a']++
    }

    for _, ch := range ransomNote {
        if counts[ch - 'a'] == 0 {
            return false
        }

        counts[ch - 'a']--
    }

    return true
}
```