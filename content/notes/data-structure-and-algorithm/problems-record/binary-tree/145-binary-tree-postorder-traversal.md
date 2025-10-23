## 145. 二叉树的后序遍历
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
func postorderTraversal(root *TreeNode) []int {
    if root == nil {
        return nil
    }

    var results []int
    results = append(results, postorderTraversal(root.Left)...)
    results = append(results, postorderTraversal(root.Right)...)
    results = append(results, root.Val)

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

func postorderTraversal(root *TreeNode) []int {
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
                frame{f.node, true},
                frame{f.node.Right, false},
                frame{f.node.Left, false},
            )
        }
    }

    return results
}
```