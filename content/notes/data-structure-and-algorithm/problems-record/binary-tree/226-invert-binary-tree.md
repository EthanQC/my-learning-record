---
title: 226 invert binary tree
date: '2025-09-03'
tags:
  - binary-tree
summary: 'queue := []*TreeNode{root}'
---
## 226. 翻转二叉树
### go：
层序遍历
```go
/**

 * Definition for a binary tree node.

 * type TreeNode struct {

 *     Val int

 *     Left *TreeNode

 *     Right *TreeNode

 * }
 */
func invertTree(root *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }

    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)

        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            node.Left, node.Right = node.Right, node.Left

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
    }

    return root
}
```

递归前序遍历
```go
/**

 * Definition for a binary tree node.

 * type TreeNode struct {

 *     Val int

 *     Left *TreeNode

 *     Right *TreeNode

 * }
 */
func invertTree(root *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }

    root.Left, root.Right = root.Right, root.Left
    invertTree(root.Left)
    invertTree(root.Right)

    return root
}
```

迭代前序遍历
```go
/**

 * Definition for a binary tree node.

 * type TreeNode struct {

 *     Val int

 *     Left *TreeNode

 *     Right *TreeNode

 * }
 */
func invertTree(root *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }

    stack := []*TreeNode{root}

    for len(stack) > 0 {
        node := stack[len(stack) - 1]
        stack = stack[: len(stack) - 1]

        if node.Right != nil {
            stack = append(stack, node.Right)
        }

        if node.Left != nil {
            stack = append(stack, node.Left)
        }

        node.Left, node.Right = node.Right, node.Left
    }

    return root
}
```

迭代后序遍历
```go
/**

 * Definition for a binary tree node.

 * type TreeNode struct {

 *     Val int

 *     Left *TreeNode

 *     Right *TreeNode

 * }
 */
func invertTree(root *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }

    stack := []*TreeNode{root}

    for len(stack) > 0 {
        node := stack[len(stack) - 1]
        stack = stack[: len(stack) - 1]

        node.Left, node.Right = node.Right, node.Left

        if node.Left != nil {
            stack = append(stack, node.Left)
        }

        if node.Right != nil {
            stack = append(stack, node.Right)
        }
    }

    return root
}
```
