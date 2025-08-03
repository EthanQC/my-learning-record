## 134. 加油站
### go：
```go
func canCompleteCircuit(gas []int, cost []int) int {
    tank, start := 0, 0
    gSum, cSum := 0, 0

    for i := 0; i < len(gas); i++ {
        gSum += gas[i]
        cSum += cost[i]

        tank += gas[i] - cost[i]
        if tank < 0 {
            start = i + 1
            tank = 0
        }
    }

    if gSum < cSum {
        return -1
    }
    return start
}
```