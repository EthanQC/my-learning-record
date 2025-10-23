## 78. 子集
### go：
```go
func subsets(nums []int) [][]int {
    var res [][]int
    var path []int
    backtrack(nums, path, &res, 0)
    return res
}

func backtrack(nums, path []int, res *[][]int, start int) {
    temp := make([]int, len(path))
    copy(temp, path)
    *res = append(*res, temp)

    for i := start; i < len(nums); i++ {
        path = append(path, nums[i])
        backtrack(nums, path, res, i + 1)
        path = path[: len(path) - 1]
    }
}
```