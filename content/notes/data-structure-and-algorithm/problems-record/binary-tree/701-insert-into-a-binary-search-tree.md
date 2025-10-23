---
title: 701 insert into a binary search tree
date: '2025-09-03'
tags:
  - binary-tree
summary: >-
  if root.Val > val { root.Left = insertIntoBST(root.Left, val) } else {
  root.Right = insertIntoBST(root.Right, val) }
---
## 701. 二叉搜索树中的插入操作
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
func insertIntoBST(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return &TreeNode{Val: val}
    }

    if root.Val > val {
        root.Left = insertIntoBST(root.Left, val)
    } else {
        root.Right = insertIntoBST(root.Right, val)
    }

    return root
}
```
