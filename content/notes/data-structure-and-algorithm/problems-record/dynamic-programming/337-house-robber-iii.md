---
title: 337 house robber iii
date: '2025-09-03'
tags:
  - dynamic-programming
summary: 'func dfs(node *TreeNode) (notTake, take int) { if node == nil { return 0, 0 }'
---
## 337. 打家劫舍 III
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
func rob(root *TreeNode) int {
    notTake, take := dfs(root)
    if notTake > take {
        return notTake
    }
    return take
}

func dfs(node *TreeNode) (notTake, take int) {
    if node == nil {
        return 0, 0
    }

    ln0, ln1 := dfs(node.Left)
    rn0, rn1 := dfs(node.Right)

    take = ln0 + rn0 + node.Val
    if ln1 > ln0 {
        ln0 = ln1
    }
    if rn1 > rn0 {
        rn0 = rn1
    }
    notTake = ln0 + rn0

    return notTake, take
}
```
