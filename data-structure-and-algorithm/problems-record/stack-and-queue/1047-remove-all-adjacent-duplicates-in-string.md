## 1047. 删除字符串中的所有相邻重复项
### go：
```go
func removeDuplicates(s string) string {
    stack := make([]byte, 0, len(s))

    for i := 0; i < len(s); i++ {
        v := s[i]

        if len(stack) > 0 && stack[len(stack) - 1] == v {
            stack = stack[: len(stack) - 1]
        } else {
            stack = append(stack, v)
        }
    }

    return string(stack)
}
```