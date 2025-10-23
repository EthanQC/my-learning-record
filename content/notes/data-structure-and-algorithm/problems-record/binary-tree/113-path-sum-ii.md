---
title: 113 path sum ii
date: '2025-09-03'
tags:
  - binary-tree
summary: 'return results }'
---
## 113. 路径总和 II
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
func pathSum(root *TreeNode, targetSum int) [][]int {
    var results [][]int
    dfs(root, targetSum, nil, &results)

    return results
}

func dfs(node *TreeNode, remaining int, path []int, results *[][]int) {
    if node == nil {
        return
    }

    path = append(path, node.Val)
    remaining -= node.Val

    if node.Left == nil && node.Right == nil && remaining == 0 {
        temp := make([]int, len(path))
        copy(temp, path)
        *results = append(*results, temp)
    }

    dfs(node.Left, remaining, path, results)
    dfs(node.Right, remaining, path, results)
}
```
