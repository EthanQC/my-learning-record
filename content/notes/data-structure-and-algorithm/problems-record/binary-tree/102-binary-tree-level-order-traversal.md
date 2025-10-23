---
title: 102 binary tree level order traversal
date: '2025-09-03'
tags:
  - binary-tree
summary: 'var results [][]int queue := []*TreeNode{root} // 由于传入的 root 就是指针类型，这里也要用指针类型'
---
## 102.二叉树的层序遍历
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
func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }

    var results [][]int
    queue := []*TreeNode{root} // 由于传入的 root 就是指针类型，这里也要用指针类型

    for len(queue) > 0 {
        levelSize := len(queue)
        levelVals := make([]int, 0, levelSize)

        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            levelVals = append(levelVals, node.Val)

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }

        results = append(results, levelVals)
    }

    return results
}
```
