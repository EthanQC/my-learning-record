## 541. 反转字符串 II
### go：

```go
func reverse(ch []byte) {
    left, right := 0, len(ch) - 1

    for left < right {
        ch[left], ch[right] = ch[right], ch[left]

        left++
        right--
    }
}

func reverseStr(s string, k int) string {
    ch := []byte(s)
    length := len(s)

    for i := 0; i < length; i += 2 * k {
        remain := length - i

        if remain < k {
            reverse(ch[i : length])
        } else {
            reverse(ch[i : i + k])
        }
    }

    return string(ch)
}
```