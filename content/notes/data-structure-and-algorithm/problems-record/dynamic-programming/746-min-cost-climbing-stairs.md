## 746. 使用最小花费爬楼梯
### go：
空间优化：
```go
func minCostClimbingStairs(cost []int) int {
    n := len(cost)
    a, b := cost[0], cost[1]

    for i := 2; i < n; i++{
        a, b = b, min(a, b) + cost[i]
    }
    return min(a, b)
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```

常规流程：
```go
func minCostClimbingStairs(cost []int) int {
    n := len(cost)
    dp := make([]int, n)
    dp[0], dp[1] = cost[0], cost[1]

    for i := 2; i < n; i++{
        dp[i] = min(dp[i - 1], dp[i - 2]) + cost[i]
    }
    return min(dp[n - 1], dp[n - 2])
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```