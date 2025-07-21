## 106. 从中序与后序遍历序列构造二叉树
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
func buildTree(inorder []int, postorder []int) *TreeNode {
    n := len(inorder)
    if n == 0 {
        return nil
    }

    idxMap := make(map[int]int, n)
    for i, v := range inorder {
        idxMap[v] = i
    }

    return buildSubTree(inorder, postorder, 0, n - 1, 0, n - 1, idxMap)
}

func buildSubTree(inorder, postorder []int, inL, inR, postL, postR int, idxMap map[int]int,) *TreeNode {
    if inL > inR || postL > postR {
        return nil
    }

    rootVal := postorder[postR]
    root := &TreeNode{Val: rootVal}

    mid := idxMap[rootVal]
    leftCount := mid - inL

    root.Left = buildSubTree(inorder, postorder, inL, mid - 1, postL, postL + leftCount - 1, idxMap,)
    root.Right = buildSubTree(inorder, postorder, mid + 1, inR, postL + leftCount, postR - 1, idxMap,)

    return root
} 
```