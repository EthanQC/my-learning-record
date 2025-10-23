---
title: 968 binary tree cameras
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: >-
  var dfs func(node *TreeNode) int dfs = func(node *TreeNode) int { if node ==
  nil { return COVERED }
---
## 968. 监控二叉树
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
func minCameraCover(root *TreeNode) int {
    const (
        HAS_CAMERA = 0
        COVERED = 1
        NOT_COVERED = 2
    )
    res := 0

    var dfs func(node *TreeNode) int
    dfs = func(node *TreeNode) int {
        if node == nil {
            return COVERED
        }

        l, r := dfs(node.Left), dfs(node.Right)
        if l == NOT_COVERED || r == NOT_COVERED {
            res++
            return HAS_CAMERA
        }
        if l == HAS_CAMERA || r == HAS_CAMERA {
            return COVERED
        }
        return NOT_COVERED
    }

    if dfs(root) == NOT_COVERED {
        res++
    }

    return res
}
```
