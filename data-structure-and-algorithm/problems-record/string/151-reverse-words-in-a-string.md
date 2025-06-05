## 541. 反转字符串 II
### go：
简易版：借助库函数
```go
import (
    "strings"
)
// reverseWords 将字符串 s 中的单词顺序反转，
// 并且保证单词之间仅用单个空格分隔，没有多余的首尾空格。
func reverseWords(s string) string {
    // 1. 用 strings.Fields 拆分并自动去掉空格
    //    例如："  the   sky is  blue  " → []string{"the", "sky", "is", "blue"}
    words := strings.Fields(s)
    
    // 2. 把 words 这个切片逆序
    for left, right := 0, len(words)-1; left < right; left, right = left+1, right-1 {
        words[left], words[right] = words[right], words[left]
    }
    
    // 3. 用单个空格把逆序后的单词拼回去
    return strings.Join(words, " ")
}
```

完全自己实现：
```go
func reverseWords(s string) string {
    length := len(s)
    left, right := 0, length - 1

    if left <= right && s[left] == ' ' {
        left++
    }

    if left <= right && s[right] == ' ' {
        right--
    }

    if left > right {
        return ""
    }

    var words []string

    for left <= right {
        if s[left] == ' ' {
            left++
            continue
        }

        start := left

        for left <= right && s[left] != ' ' {
            left++
        }

        words = append(words, s[start : left])
    }

    for l, r := 0, len(words) - 1; l < r; l, r = l + 1, r - 1 {
        words[l], words[r] = words[r], words[l]
    }

    var results string

    for index, w := range words {
        if index > 0 {
            results += " "
        }

        results += w
    }

    return results
}
```