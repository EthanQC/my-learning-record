---
title: 1047 remove all adjacent duplicates in string
date: '2025-09-03'
tags:
  - stack-and-queue
summary: 'for i := 0; i < len(s); i++ { v := s[i]'
---
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
