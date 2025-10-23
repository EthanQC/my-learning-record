---
title: 112 path sum
date: '2025-09-03'
tags:
  - binary-tree
summary: 'remaining := targetSum - root.Val'
---
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
