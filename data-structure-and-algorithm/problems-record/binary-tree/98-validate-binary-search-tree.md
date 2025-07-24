## 98. 验证二叉搜索树
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

var prev *TreeNode

func isValidBST(root *TreeNode) bool {
    prev = nil
    return inorder(root)
}

func inorder(root *TreeNode) bool {
    if root == nil {
        return true
    }

    if !inorder(root.Left) {
        return false
    }

    if prev != nil && prev.Val >= root.Val {
        return false
    }

    prev = root

    return inorder(root.Right)
}
```