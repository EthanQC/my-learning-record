## 406. 根据身高重建队列
### go：
```go
import "sort"

func reconstructQueue(people [][]int) [][]int {
    sort.Slice(people, func(i, j int) bool {
        if people[i][0] != people[j][0] {
            return people[i][0] > people[j][0]
        }
        return people[i][1] < people[j][1]
    })

    queue := make([][]int, 0, len(people))
    for _, p := range people {
        k := p[1]
        front := queue[: k]
        back := queue[k :]
        queue = append(front, append([][]int{p}, back...)...)
    }

    return queue
}
```