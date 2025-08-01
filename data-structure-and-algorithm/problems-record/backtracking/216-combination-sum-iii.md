## 216. 组合总和 III
### go：
```go
func combinationSum3(k int, n int) [][]int {
    var results [][]int
    var path [] int
    backtrack(&results, path, k, n, 0, 1)

    return results
}

func backtrack(results *[][]int, path []int, k, n, sum, start int) {
    if len(path) > k || sum > n {
        return
    }

    if sum == n && len(path) == k {
        temp := make([]int, len(path))
        copy(temp, path)
        *results = append(*results, temp)
    }

    for i := start; i <= 9 - (k -len(path)) + 1; i++{
        path = append(path, i)
        backtrack(results, path, k, n, sum + i, i + 1)
        path = path[: len(path) - 1]
    }
}
```