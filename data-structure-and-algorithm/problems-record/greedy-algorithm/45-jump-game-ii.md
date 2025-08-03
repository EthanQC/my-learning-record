## 45. 跳跃游戏 II
### go：
```go
func jump(nums []int) int {
    if len(nums) < 2 {
        return 0
    }

    end, f, count := 0, 0, 0
    for i, v := range nums {
        if f < i + v {
            f = i + v
        }

        if i == end {
            end = f
            count++
            if end >= len(nums) - 1{
                break
            }
        }
    }
    return count
}
```