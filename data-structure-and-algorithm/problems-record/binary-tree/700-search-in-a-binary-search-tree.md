## 700. 二叉搜索树中的搜索
### go：
递归
```go
/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func searchBST(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return nil
    }

    switch {
        case root.Val == val:
            return root
        case root.Val > val :
            return searchBST(root.Left, val)
        default: 
            return searchBST(root.Right, val)
    }
}
```

迭代
```go
/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func searchBST(root *TreeNode, val int) *TreeNode {
    for root != nil {
        if root.Val == val {
            return root
        } else if root.Val > val {
            root = root.Left
        } else {
            root = root.Right
        }
    }

    return nil
}
```