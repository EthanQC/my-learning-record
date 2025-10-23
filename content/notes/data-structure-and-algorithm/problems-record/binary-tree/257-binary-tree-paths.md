---
title: 257 binary tree paths
date: '2025-09-03'
tags:
  - binary-tree
summary: import "strconv"
---
## 257. 二叉树的所有路径
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

import "strconv"

func binaryTreePaths(root *TreeNode) []string {
    if root == nil {
        return nil
    }

    if root.Left == nil && root.Right == nil {
        return []string{strconv.Itoa(root.Val)}
    }

    var results []string

    leftPaths := binaryTreePaths(root.Left)
    for _, p := range leftPaths {
        results = append(results, strconv.Itoa(root.Val) + "->" + p)
    }

    rightPaths := binaryTreePaths(root.Right)
    for _, p := range rightPaths {
        results = append(results, strconv.Itoa(root.Val) + "->" + p)
    }

    return results
}
```
