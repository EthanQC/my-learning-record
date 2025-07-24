## 654. 最大二叉树
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
func constructMaximumBinaryTree(nums []int) *TreeNode {
    if len(nums) == 0 {
        return nil
    }

    maxIdx := 0
    for i, _ := range nums {
        if nums[maxIdx] < nums[i] {
            maxIdx = i
        }
    }

    root := &TreeNode{Val: nums[maxIdx]}
    root.Left = constructMaximumBinaryTree(nums[: maxIdx])
    root.Right = constructMaximumBinaryTree(nums[maxIdx + 1 :])

    return root    
}
```