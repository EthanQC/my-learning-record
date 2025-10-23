---
title: 94 binary tree inorder traversal
date: '2025-09-03'
tags:
  - binary-tree
summary: >-
  var results []int results = append(results, inorderTraversal(root.Left)...)
  results = append(results, root.Val) results = append(results,
  inorderTraversal(root.Right)...)
---
## 94. 二叉树的中序遍历
### go：
递归法
```go
/**

 * Definition for a binary tree node.

 * type TreeNode struct {

 *     Val int

 *     Left *TreeNode

 *     Right *TreeNode

 * }
 */
func inorderTraversal(root *TreeNode) []int {
    if root == nil {
        return nil
    }

    var results []int
    results = append(results, inorderTraversal(root.Left)...)
    results = append(results, root.Val)
    results = append(results, inorderTraversal(root.Right)...)

    return results
}
```

迭代法
```go
/**

 * Definition for a binary tree node.

 * type TreeNode struct {

 *     Val int

 *     Left *TreeNode

 *     Right *TreeNode

 * }
 */

type frame struct {
    node *TreeNode
    visited bool
}

func inorderTraversal(root *TreeNode) []int {
    if root == nil {
        return nil
    }

    var results []int
    stack := []frame{{root, false}}

    for len(stack) > 0 {
        f := stack[len(stack) - 1]
        stack = stack[: len(stack) - 1]

        if f.node == nil {
            continue
        }

        if f.visited {
            results = append(results, f.node.Val)
        } else {
            stack = append(stack,
                frame{f.node.Right, false},
                frame{f.node, true},
                frame{f.node.Left, false},
            )
        }
    }

    return results
}
```
