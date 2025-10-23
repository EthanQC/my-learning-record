## 47. 全排列 II
### go：
```go
import "sort"

func permuteUnique(nums []int) [][]int {
    sort.Ints(nums)
    var res [][]int
    var path []int
    used := make([]bool, len(nums))
    backtrack(nums, path, &res, used)
    return res
}

func backtrack(nums, path []int, res *[][]int, used []bool) {
    if len(path) == len(nums) {
        temp := make([]int, len(path))
        copy(temp, path)
        *res = append(*res, temp)
    }

    for i := 0; i < len(nums); i++ {
        if used[i] {
            continue
        }
        if i > 0 && nums[i] == nums[i - 1] && !used[i - 1] {
            continue
        }

        used[i] = true
        path = append(path, nums[i])
        backtrack(nums, path, res, used)
        used[i] = false
        path = path[: len(path) - 1]
    }
}
```