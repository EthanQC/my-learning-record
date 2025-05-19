## 160. 相交链表
### go：

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func getIntersectionNode(headA, headB *ListNode) *ListNode {
    pA, pB := headA, headB

    for pA != pB {
        if pA == nil {
            pA = headB
        } else {
            pA = pA.Next
        }

        if pB == nil {
            pB = headA
        } else {
            pB = pB.Next
        }
    }

    return pA
}
```