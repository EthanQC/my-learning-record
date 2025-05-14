## 203. 移除链表元素
### cpp：

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* removeElements(ListNode* head, int val)
    {
        ListNode *dummyHead = new ListNode();
        dummyHead->next = head;

        ListNode *current = dummyHead;
        
        while (current->next != nullptr)
        {
            if (current->next->val == val)
            {
                current->next = current->next->next;
            }
            else
            {
                current = current->next;
            }
        }

        return dummyHead->next;
    }
};
```

### go：

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func removeElements(head *ListNode, val int) *ListNode {
    dummyHead := &ListNode{Next: head}

    current := dummyHead

    for current.Next != nil {
        if current.Next.Val == val {
            current.Next = current.Next.Next
        } else {
            current = current.Next
        }
    }

    return dummyHead.Next
}
```