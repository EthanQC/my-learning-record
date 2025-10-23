---
title: 142 linked list cycle ii
date: '2025-09-03'
tags:
  - linked-list
summary: >-
  ```go /** * Definition for singly-linked list. * type ListNode struct { * Val
  int * Next *ListNode * } */ func detectCycle(head *ListNode) *ListNode { fast,
  slow := head, head
---
## 142. 环形链表 II
### go：

```go
/**

 * Definition for singly-linked list.

 * type ListNode struct {

 *     Val int

 *     Next *ListNode

 * }
 */
func detectCycle(head *ListNode) *ListNode {
    fast, slow := head, head

    for fast != nil && fast.Next != nil {
        fast = fast.Next.Next
        slow = slow.Next

        if fast == slow {
            break
        }
    }

    if fast == nil || fast.Next == nil {
        return nil
    }

    fast = head

    for fast != slow {
        fast = fast.Next
        slow = slow.Next
    }

    return fast
}
```
