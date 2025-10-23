---
title: 404 sum of left leaves
date: '2025-09-03'
tags:
  - binary-tree
summary: var sum int
---
## 404. 左叶子之和
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
func sumOfLeftLeaves(root *TreeNode) int {
    if root == nil {
        return 0
    }

    var sum int

    if root.Left != nil && root.Left.Left == nil && root.Left.Right == nil {
        sum += root.Left.Val
    }

    sum += sumOfLeftLeaves(root.Left)
    sum += sumOfLeftLeaves(root.Right)

    return sum
}
```
