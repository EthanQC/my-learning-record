---
title: 669 trim a binary search tree
date: '2025-09-03'
tags:
  - binary-tree
summary: >-
  if root.Val < low { return trimBST(root.Right, low, high) } if root.Val > high
  { return trimBST(root.Left, low, high) }
---
## 669. 修剪二叉搜索树
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
func trimBST(root *TreeNode, low int, high int) *TreeNode {
    if root == nil {
        return nil
    }

    if root.Val < low {
        return trimBST(root.Right, low, high)
    }
    if root.Val > high {
        return trimBST(root.Left, low, high)
    }

    root.Left = trimBST(root.Left, low, high)
    root.Right = trimBST(root.Right, low, high)

    return root
}
```
