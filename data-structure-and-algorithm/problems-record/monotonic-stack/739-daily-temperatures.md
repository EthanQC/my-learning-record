## 739. 每日温度
### go：
```go
func dailyTemperatures(temperatures []int) []int {
    n := len(temperatures)
    ans, stack := make([]int, n), make([]int, 0, n)

    for i := 0; i < n; i++ {
        for len(stack) > 0 && temperatures[i] > temperatures[stack[len(stack) - 1]] {
            j := stack[len(stack) - 1]
            stack = stack[: len(stack) - 1]
            ans[j] = i - j
        }
        stack = append(stack, i)
    }

    return ans
}
```