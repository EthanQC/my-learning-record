---
title: 236 lowest common ancestor of a binary tree
date: '2025-09-03'
tags:
  - binary-tree
summary: >-
  l := lowestCommonAncestor(root.Left, p, q) r :=
  lowestCommonAncestor(root.Right, p, q)
---
## 236. 二叉树的最近公共祖先
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
 func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == q || root == p {
        return root
    }

    l := lowestCommonAncestor(root.Left, p, q)
    r := lowestCommonAncestor(root.Right, p, q)

    if l != nil && r != nil {
        return root
    }

    if l != nil {
        return l
    }

    return r
}
```
