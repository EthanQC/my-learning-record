---
title: 738 monotone increasing digits
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: >-
  func monotoneIncreasingDigits(n int) int { s := strconv.Itoa(n) digits :=
  []byte(s) mark := len(digits) for i := len(digits) - 1; i > 0; i-- { if
  digits[i] < digits[i - 1] { digits
---
## 738. 单调递增的数字
### go：
```go
import "strconv"

func monotoneIncreasingDigits(n int) int {
    s := strconv.Itoa(n)
    digits := []byte(s)
    mark := len(digits)
    
    for i := len(digits) - 1; i > 0; i-- {
        if digits[i] < digits[i - 1] {
            digits[i - 1]--
            mark = i
        }
    }
    for i := mark; i < len(digits); i++ {
        digits[i] = '9'
    }

    res, _ := strconv.Atoi(string(digits))
    return res
}
```
