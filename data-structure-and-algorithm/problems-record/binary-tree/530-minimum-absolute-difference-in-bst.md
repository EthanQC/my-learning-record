## 530. 二叉搜索树的最小绝对差
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

import "math"

var prev *TreeNode

func getMinimumDifference(root *TreeNode) int {
    prev = nil
    return bfs(root, math.MaxInt64)
}

func bfs(node *TreeNode, min int) int {
    if node == nil {
        return min
    }

    min = bfs(node.Left, min)

    if prev != nil && min > node.Val - prev.Val {
        min = node.Val - prev.Val
    }
    prev = node

    min = bfs(node.Right, min)

    return min
}
```