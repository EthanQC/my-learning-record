## 1002. 查找共用字符
### go：

```go
func commonChars(words []string) []string {
    counts := make([]int, 26)

    for _, ch := range words[0] {
        counts[ch - 'a']++
    }

    for i := 1; i < len(words); i++ {
        temp := make([]int, 26)
        
        for _, ch := range words[i] {
            temp[ch - 'a']++
        }

        for j := 0; j < 26; j++ {
            if counts[j] > temp[j] {
                counts[j] = temp[j]
            }
        }
    }

    var results []string

    for i := 0; i < 26; i++ {
        for j := 0; j < counts[i]; j++ {
            results = append(results, string('a' + i))
        }
    }

    return results
}
```