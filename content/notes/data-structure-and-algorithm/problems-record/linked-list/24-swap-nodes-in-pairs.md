---
title: 24 swap nodes in pairs
date: '2025-09-03'
tags:
  - linked-list
summary: >-
  ```go /** * Definition for singly-linked list. * type ListNode struct { * Val
  int * Next *ListNode * } */
---
## 24. 两两交换链表中的节点
### go：

```go
/**

 * Definition for singly-linked list.

 * type ListNode struct {

 *     Val int

 *     Next *ListNode

 * }
 */

func swapPairs(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    cur := dummy

    for cur.Next != nil && cur.Next.Next != nil {
        first := cur.Next
        second := cur.Next.Next

        first.Next = second.Next
        second.Next = first
        cur.Next = second

        cur = first
    }

    return dummy.Next
}
```
