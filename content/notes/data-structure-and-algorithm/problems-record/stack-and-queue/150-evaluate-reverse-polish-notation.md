---
title: 150 evaluate reverse polish notation
date: '2025-09-03'
tags:
  - stack-and-queue
summary: 'func evalRPN(tokens []string) int { stack := make([]int, 0, len(tokens))'
---
## 150. 逆波兰表达式求值
### go：
```go
import "strconv"

func evalRPN(tokens []string) int {
    stack := make([]int, 0, len(tokens))

    for _, v := range tokens {
        switch v {
            case "+":
                a := stack[len(stack) - 1]
                b := stack[len(stack) - 2]
                stack = stack[: len(stack) - 2]
                stack = append(stack, a + b)
            case "-":
                a := stack[len(stack) - 1]
                b := stack[len(stack) - 2]
                stack = stack[: len(stack) - 2]
                stack = append(stack, b - a)
            case "*":
                a := stack[len(stack) - 1]
                b := stack[len(stack) - 2]
                stack = stack[: len(stack) - 2]
                stack = append(stack, a * b)
            case "/":
                a := stack[len(stack) - 1]
                b := stack[len(stack) - 2]
                stack = stack[: len(stack) - 2]
                stack = append(stack, b / a)
            default:
                num, err := strconv.Atoi(v)

                if err != nil {
                    panic("invalid token: " + v)
                }

                stack = append(stack, num)
        }
    }
    
    return stack[0]
}
```
