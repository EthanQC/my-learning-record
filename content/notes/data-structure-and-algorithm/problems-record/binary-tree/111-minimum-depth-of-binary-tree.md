---
title: 111 minimum depth of binary tree
date: '2025-09-03'
tags:
  - binary-tree
summary: 'queue := []*TreeNode{root} depth := 0 levels := 0'
---
## 111. 二叉树的最小深度
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
func minDepth(root *TreeNode) int {
    if root == nil {
        return 0
    }

    queue := []*TreeNode{root}
    depth := 0
    levels := 0

    for len(queue) > 0 {
        levelSize := len(queue)
        levels += 1

        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }

            if node.Left == nil && node.Right == nil {
                depth = levels
                return depth
            }
        }
    }

    return depth
}
```
