## 232. 用栈实现队列
### go：
```go
type myQueue struct {
    data []int
}

func (q *myQueue) Push(v int) {
    q.data = append(q.data, v)
}

func (q *myQueue) Pop() int {
    if len(q.data) == 0 {
        return 0
    }

    v := q.data[0]
    q.data = q.data[1 :]

    return v
}

func (q *myQueue) Top() int {
    if len(q.data) == 0 {
        return 0
    }

    v := q.data[0]

    return v
}

func (q *myQueue) Empty() bool {
    return len(q.data) == 0
}

type MyStack struct {
    myQueue *myQueue
}

func Constructor() MyStack {
    return MyStack{
        myQueue: &myQueue{},
    }
}

func (this *MyStack) Push(x int)  {
    this.myQueue.Push(x)

    length := len(this.myQueue.data)

    for i := 0; i < length - 1; i++ {
        v := this.myQueue.Pop()
        this.myQueue.Push(v)
    }
}

func (this *MyStack) Pop() int {
    return this.myQueue.Pop()
}

func (this *MyStack) Top() int {
    return this.myQueue.Top()
}

func (this *MyStack) Empty() bool {
    return this.myQueue.Empty()
}

/**
 * Your MyStack object will be instantiated and called as such:
 * obj := Constructor();
 * obj.Push(x);
 * param_2 := obj.Pop();
 * param_3 := obj.Top();
 * param_4 := obj.Empty();
 */
```