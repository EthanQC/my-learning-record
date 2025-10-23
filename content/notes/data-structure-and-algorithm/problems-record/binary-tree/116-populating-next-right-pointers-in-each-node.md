---
title: 116 populating next right pointers in each node
date: '2025-09-03'
tags:
  - binary-tree
summary: 'func connect(root *Node) *Node { if root == nil { return nil }'
---
## 116. 填充每个节点的下一个右侧节点指针
### go：
层序遍历
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
                queue = append(queue, n.Right)
            }
        }
    }

    return root
}
```

指针法
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

    for leftm := root; leftm.Left != nil; leftm = leftm.Left {
        for cur := leftm; cur != nil; cur = cur.Next {
            cur.Left.Next = cur.Right

            if cur.Next != nil {
                cur.Right.Next = cur.Next.Left
            }
        }
    }

    return root
}
```
