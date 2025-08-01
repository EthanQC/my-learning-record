## 538. 把二叉搜索树转换为累加树
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

var sum int

func convertBST(root *TreeNode) *TreeNode {
    sum = 0
    dfs(root)
    return root
}

func dfs(root *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }

    root.Right = dfs(root.Right)
    sum += root.Val
    root.Val = sum
    root.Left = dfs(root.Left)

    return root
}
```