## 206. 反转链表
### go：
#### 双指针法：

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func reverseList(head *ListNode) *ListNode {
    cur := head
    var pre *ListNode

    for cur != nil {
        temp := cur.Next
        cur.Next = pre
        pre = cur
        cur = temp
    }

    return pre
}
```