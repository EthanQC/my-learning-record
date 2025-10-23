## 1049. 最后一块石头的重量 II
### go：
```go
func lastStoneWeightII(stones []int) int {
    sum := 0
    for _, v := range stones {
        sum += v
    }
    cap := sum / 2

    dp := make([]bool, cap + 1)
    dp[0] = true
    for _, w := range stones {
        if w > cap {
            continue
        }

        for i := cap; i >= w; i-- {
            if dp[i - w] {
                dp[i] = true
            }
        }
    }

    for j := cap; j >= 0; j-- {
        if dp[j] {
            return sum - 2 * j
        }
    }
    return 0
}
```