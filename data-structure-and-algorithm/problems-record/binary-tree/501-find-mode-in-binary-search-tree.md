## 501. 二叉搜索树中的众数
### go：
```go
/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func findMode(root *TreeNode) []int {
    var arr []int
    bfs(root, &arr)
    return find(arr)
}

func bfs(node *TreeNode, arr *[]int) {
    if node == nil {
        return
    }

    bfs(node.Left, arr)
    *arr = append(*arr, node.Val)
    bfs(node.Right, arr)
}

func find(arr []int) []int {
    if len(arr) < 0 {
        return nil
    }

    count, maxCount := 1, 1
    results := []int{arr[0]}

    for i := 1; i < len(arr); i++ {
        if arr[i] == arr[i - 1] {
            count++
        } else {
            count = 1
        }

        if count > maxCount {
            maxCount = count
            results = []int{arr[i]}
        } else if count == maxCount {
            results = append(results, arr[i])
        }
    }

    return results
}
```