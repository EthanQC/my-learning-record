## 222. 完全二叉树的节点个数
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
func countNodes(root *TreeNode) int {
    if root == nil {
        return 0
    }

    count := 0
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)

        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1 :]

            if node.Left != nil {
                queue = append(queue, node.Left)
            }

            if node.Right != nil {
                queue = append(queue, node.Right)
            }

            count++
        }
    }

    return count
}
```

利用完全二叉树特性 + 递归
```go
/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func countNodes(root *TreeNode) int {
    if root == nil {
        return 0
    }

    l, r := depth(root.Left), depth(root.Right)

    if l == r {
        return (1 << l) + countNodes(root.Right)
    } else {
        return (1 << r) + countNodes(root.Left)
    }
}

func depth(node *TreeNode) int {
    d := 0

    for node != nil {
        d++
        node = node.Left
    }

    return d
}
```