---
title: 144 binary tree preorder traversal
date: '2025-09-03'
tags:
  - binary-tree
summary: 'return results } ```'
---
## 144. 二叉树的前序遍历
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
func preorderTraversal(root *TreeNode) []int {
    if root == nil {
        return nil
    }
    
    results := []int{root.Val}
    results = append(results, preorderTraversal(root.Left)...)
    results = append(results, preorderTraversal(root.Right)...)

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

func preorderTraversal(root *TreeNode) []int {
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
                frame{f.node.Left, false},
                frame{f.node, true},
            )
        }
    }

    return results
}
```
