## 117. 填充每个节点的下一个右侧节点指针 II
### go：
```go
/**
 * Definition for a Node.
 * type Node struct {
 *     Val int
 *     Left *Node
 *     Right *Node
 *     Next *Node
 * }
 */

func connect(root *Node) *Node {
	if root == nil {
        return nil
    }

    queue := []*Node{root}

    for len(queue) > 0 {
        levelSize := len(queue)
        var prev *Node

        for i := 0; i < levelSize; i++ {
            n := queue[0]
            queue = queue[1 :]

            if prev != nil {
                prev.Next = n
            }

            prev = n

            if n.Left != nil {
                queue = append(queue, n.Left)
            }

            if n.Right != nil {
                queue = append(queue, n.Right)
            }
        }
    }

    return root
}
```