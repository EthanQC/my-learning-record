---
title: 110 balanced binary tree
date: '2025-09-03'
tags:
  - binary-tree
summary: 'func checkHeight(node *TreeNode) int { if node == nil { return 0 }'
---
## 110. 平衡二叉树
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
func isBalanced(root *TreeNode) bool {
    return checkHeight(root) != -1
}

func checkHeight(node *TreeNode) int {
    if node == nil {
        return 0
    }

    lh := checkHeight(node.Left)
    if lh == -1 {
        return -1
    }

    rh := checkHeight(node.Right)
    if rh == -1 {
        return -1
    }

    if abs(lh - rh) > 1 {
        return -1
    }

    return max(lh, rh) + 1
}

func abs(x int) int {
    if x < 0 {
        return -x
    }

    return x
}

func max(a, b int) int {
    if a > b {
        return a
    }

    return b
}
```
