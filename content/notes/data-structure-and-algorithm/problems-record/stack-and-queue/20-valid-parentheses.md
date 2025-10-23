## 20. 有效的括号
### go：
```go
func isValid(s string) bool {
    length := len(s)

    if length % 2 == 1 {
        return false
    }

    pairs := map[byte]byte {
        ')': '(',
        ']': '[',
        '}': '{',
    }

    stack := make([]byte, 0, length)

    for i := 0; i < length; i++ {
        c := s[i]

        switch c {
            case '(', '[', '{':
                stack = append(stack, c)
            case ')', ']', '}':
                if len(stack) == 0 {
                    return false
                }

                idx := len(stack) - 1
                top := stack[idx]
                stack = stack[: idx]

                if top != pairs[c] {
                    return false
                }
            default:
                return false
        }
    }

    return len(stack) == 0
}
```