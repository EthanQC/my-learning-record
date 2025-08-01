## 40. 组合总和 II
### go：
```go
import "sort"

func combinationSum2(candidates []int, target int) [][]int {
    sort.Ints(candidates)

    var results [][]int
    var path []int
    backtrack(candidates, &results, path, 0, 0, target)

    return results
}

func backtrack(candidates []int, results *[][]int, path []int, start, sum, target int) {
    if sum > target {
        return
    }
    if sum == target {
        temp := make([]int, len(path))
        copy(temp, path)
        *results = append(*results, temp)
    }

    for i := start; i < len(candidates); i++ {
        if sum + candidates[i] > target {
            return
        }
        if i > start && candidates[i] == candidates[i - 1] {
            continue
        }

        path = append(path, candidates[i])
        sum += candidates[i]

        backtrack(candidates, results, path, i + 1, sum, target)

        path = path[: len(path) - 1]
        sum -= candidates[i]
    }
}
```