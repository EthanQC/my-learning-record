---
title: 637 average of levels in binary tree
date: '2025-09-03'
tags:
  - binary-tree
summary: 'var results []float64 queue := []*TreeNode{root}'
---
## 637. 二叉树的层平均值
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
func averageOfLevels(root *TreeNode) []float64 {
    if root == nil {
        return nil
    }

    var results []float64
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)
        sum := 0

        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            sum += node.Val

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }

        avg := float64(sum) / float64(levelSize)
        results = append(results, avg)
    }

    return results
}
```
