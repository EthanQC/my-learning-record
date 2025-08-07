## 494. 目标和
### go：
```go
func findTargetSumWays(nums []int, target int) int {
    s := 0
    for _, v := range nums {
        s += v
    }

    if (target + s) % 2 != 0 || abs(target) > s {
        return 0
    }
    p := (target + s) / 2
    dp := make([]int, p + 1)
    dp[0] = 1

    for _, n := range nums {
        for j := p; j >= n; j-- {
            dp[j] += dp[j - n]
        }
    }

    return dp[p]
}

func abs(a int) int {
    if a < 0 {
        return -a
    }
    return a
}
```