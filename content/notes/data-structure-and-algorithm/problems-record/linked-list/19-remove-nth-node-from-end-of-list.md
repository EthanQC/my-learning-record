---
title: 19 remove nth node from end of list
date: '2025-09-03'
tags:
  - linked-list
summary: >-
  ```go /** * Definition for singly-linked list. * type ListNode struct { * Val
  int * Next *ListNode * } */ func removeNthFromEnd(head *ListNode, n int)
  *ListNode { dummy := &ListNod
---
## 19. 删除链表的倒数第 N 个结点
### go：

```go
/**

 * Definition for singly-linked list.

 * type ListNode struct {

 *     Val int

 *     Next *ListNode

 * }
 */
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    fast := dummy
    slow := dummy

    for i := 0; i < n + 1; i++ {
        fast = fast.Next
    }

    for fast != nil {
        fast = fast.Next
        slow = slow.Next
    }

    slow.Next = slow.Next.Next
    
    return dummy.Next
}
```
