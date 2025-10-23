---
title: 707 design linked list
date: '2025-09-03'
tags:
  - linked-list
summary: >-
  ```cpp class MyLinkedList { private: class MyNode { public: int val; MyNode*
  next;
---
## 707. 设计链表

### cpp：

```cpp
class MyLinkedList 
{
private:
    class MyNode
    {
    public:
        int val;
        MyNode* next;

        MyNode(int val): val(val), next(nullptr) {}
    };

    int linksize = 0;
    MyNode* current;
    MyNode* dummyhead;

public:
    MyLinkedList()
    {
        dummyhead = new MyNode(0);
    }
    
    int get(int index)
    {
        current = dummyhead;

        if (index < 0 || index >= linksize)
        {
            return -1;
        }

        for (int i = 0; i < index; i++)
        {
            current = current->next;
        }

        return current->next->val;
    }
    
    void addAtHead(int val)
    {
        addAtIndex(0, val);
    }
    
    void addAtTail(int val)
    {
        addAtIndex(linksize, val);
    }
    
    void addAtIndex(int index, int val)
    {
        current = dummyhead;

        if (index > linksize)
        {
            return;
        }

        for (int i = 0; i < index; i++)
        {
            current = current->next;
        }

        MyNode* newnode = new MyNode(val);
        newnode->next = current->next;
        current->next = newnode;

        linksize++;
    }
    
    void deleteAtIndex(int index)
    {
        current = dummyhead;

        if (index < 0 || index >= linksize)
        {
            return;
        }

        for (int i = 0; i < index; i++)
        {
            current = current->next;
        }

        MyNode* toDelete = current->next;
        current->next = toDelete->next;
        linksize--;
    }
};

/**

 * Your MyLinkedList object will be instantiated and called as such:

 * MyLinkedList* obj = new MyLinkedList();

 * int param_1 = obj->get(index);

 * obj->addAtHead(val);

 * obj->addAtTail(val);

 * obj->addAtIndex(index,val);

 * obj->deleteAtIndex(index);
 */
 ```

### go：

```go
type Node struct {
    val int
    next *Node
}

type MyLinkedList struct {
    head *Node
    length int
}

func Constructor() MyLinkedList {
    return MyLinkedList{head: &Node{}}
}

func (this *MyLinkedList) Get(index int) int {
    cur := this.head

    if index < 0 || index >= this.length {
        return -1
    }
    
    for i := 0; i <= index; i++ {
        cur = cur.next
    }

    return cur.val
}

func (this *MyLinkedList) AddAtHead(val int)  {
    n := &Node{val: val}
    n.next = this.head.next
    this.head.next = n

    this.length++
}

func (this *MyLinkedList) AddAtTail(val int)  {
    n := &Node{val: val}
    cur := this.head

    for cur.next != nil {
        cur = cur.next
    }

    cur.next = n
    this.length++
}


func (this *MyLinkedList) AddAtIndex(index int, val int)  {
    n := &Node{val: val}
    cur := this.head

    if index < 0 || index > this.length {
        return
    }

    for i := 0; i < index; i++ {
        cur = cur.next
    }

    n.next = cur.next
    cur.next = n

    this.length++
}


func (this *MyLinkedList) DeleteAtIndex(index int)  {
    cur := this.head

    if index < 0 || index >= this.length {
        return
    }

    for i := 0; i < index; i++ {
        cur = cur.next
    }

    cur.next = cur.next.next

    this.length--
}


/**

 * Your MyLinkedList object will be instantiated and called as such:

 * obj := Constructor();

 * param_1 := obj.Get(index);

 * obj.AddAtHead(val);

 * obj.AddAtTail(val);

 * obj.AddAtIndex(index,val);

 * obj.DeleteAtIndex(index);
 */
 ```
