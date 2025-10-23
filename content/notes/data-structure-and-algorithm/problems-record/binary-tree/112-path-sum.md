## 112. 路径总和
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
func hasPathSum(root *TreeNode, targetSum int) bool {
    if root == nil {
        return false
    }

    remaining := targetSum - root.Val

    if root.Left == nil && root.Right == nil {
        return remaining == 0
    }

    return hasPathSum(root.Left, remaining) || hasPathSum(root.Right, remaining)
}
```