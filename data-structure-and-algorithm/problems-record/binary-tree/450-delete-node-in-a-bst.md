## 450. 删除二叉搜索树中的节点
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
func deleteNode(root *TreeNode, key int) *TreeNode {
    if root == nil {
        return nil
    }

    if key < root.Val {
        root.Left = deleteNode(root.Left, key)
        return root
    }
    if key > root.Val {
        root.Right = deleteNode(root.Right, key)
        return root
    }

    if root.Left == nil {
        return root.Right
    }
    if root.Right == nil {
        return root.Left
    }

    succ := root.Right
    for succ.Left != nil {
        succ = succ.Left
    }
    succ.Left = root.Left

    return root.Right
}
```