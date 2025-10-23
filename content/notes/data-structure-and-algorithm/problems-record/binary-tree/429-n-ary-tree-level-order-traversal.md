---
title: 429 n ary tree level order traversal
date: '2025-09-03'
tags:
  - binary-tree
summary: 'func levelOrder(root *Node) [][]int { if root == nil { return nil }'
---
## 429. N 叉树的层序遍历
### go：
```go
/**

 * Definition for a Node.

 * type Node struct {

 *     Val int

 *     Children []*Node

 * }
 */

func levelOrder(root *Node) [][]int {
    if root == nil {
        return nil
    }

    var results [][]int
    queue := []*Node{root}
    
    for len(queue) > 0 {
        levelSize := len(queue)
        levelVals := make([]int, 0, levelSize)

        for i := 0; i < levelSize; i++ {
            n := queue[0]
            queue = queue[1 :]

            levelVals = append(levelVals, n.Val)

            for _, child := range n.Children {
                if child != nil {
                    queue = append(queue, child)
                }
            }
        }

        results = append(results, levelVals)
    }

    return results
}
```
