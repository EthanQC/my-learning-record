## 107. 二叉树的层序遍历 II
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
func levelOrderBottom(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }

    var results [][]int
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)
        levelVals := make([]int, 0, levelSize)

        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            levelVals = append(levelVals, node.Val)

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }

        results = append(results, levelVals)
    }

    for i, j := 0, len(results) - 1; i < j; i, j = i + 1, j - 1 {
        results[i], results[j] = results[j], results[i]
    }

    return results
}
```