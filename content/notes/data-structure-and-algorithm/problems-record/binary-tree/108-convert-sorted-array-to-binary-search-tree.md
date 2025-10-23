---
title: 108 convert sorted array to binary search tree
date: '2025-09-03'
tags:
  - binary-tree
summary: 'func build(nums []int, l, r int) *TreeNode { if l > r { return nil }'
---
## 108. 将有序数组转换为二叉搜索树
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
func sortedArrayToBST(nums []int) *TreeNode {
    return build(nums, 0, len(nums) - 1)
}

func build(nums []int, l, r int) *TreeNode {
    if l > r {
        return nil
    }

    mid := (l + r) / 2
    root := &TreeNode{Val: nums[mid]}

    root.Left = build(nums, l, mid - 1)
    root.Right = build(nums, mid + 1, r)

    return root
}
```
