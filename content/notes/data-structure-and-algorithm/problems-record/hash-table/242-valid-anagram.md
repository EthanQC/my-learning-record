---
title: 242 valid anagram
date: '2025-09-03'
tags:
  - hash-table
summary: '```go func isAnagram(s string, t string) bool { counts := make([]int, 26)'
---
## 242. 有效的字母异位词
### go：

```go
func isAnagram(s string, t string) bool {
    counts := make([]int, 26)

    if len(s) != len(t) {
        return false
    }

    for _, ch := range s {
        counts[ch - 'a']++
    }

    for _, ch := range t {
        counts[ch - 'a']--
    }

    for _, ele := range counts {
        if ele != 0 {
            return false
        }
    }

    return true
}
```
