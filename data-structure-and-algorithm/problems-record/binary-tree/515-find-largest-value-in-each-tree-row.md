## 515. 在每个树行中找最大值
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
func largestValues(root *TreeNode) []int {
    if root == nil {
        return nil
    }

    var results []int
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)
        max := queue[0].Val
        
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            if max < node.Val {
                max = node.Val
            }

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }

        results = append(results, max)
    }

    return results
}
```