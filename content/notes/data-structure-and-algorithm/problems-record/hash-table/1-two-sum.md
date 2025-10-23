## 1. 两数之和
### go：

```go
func twoSum(nums []int, target int) []int {
    seen := make(map[int]int, len(nums))

    for i, v := range nums {
        need := target - v

        if j, ok := seen[need]; ok {
            return []int{i, j}
        }

        seen[v] = i
    }

    return nil
}
```