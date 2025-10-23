## 232. 用栈实现队列
### go：
```go
type myStack struct {
    data []int
}

func (s *myStack) Push(val int) {
    s.data = append(s.data, val)
}

func (s *myStack) Pop() int {
    length := len(s.data)

    if length == 0 {
        return 0
    }

    idx := length - 1
    v := s.data[idx]
    s.data = s.data[: idx]

    return v
}

func (s *myStack) Top() int {
    length := len(s.data)

    if length == 0 {
        return 0
    }

    return s.data[length - 1]
}

func (s *myStack) Empty() bool {
    return len(s.data) == 0
}
 
type MyQueue struct {
    inStack *myStack
    outStack *myStack
}


func Constructor() MyQueue {
    return MyQueue{
        inStack: &myStack{},
        outStack: &myStack{},
    }
}


func (this *MyQueue) Push(x int)  {
    this.inStack.Push(x)
}


func (this *MyQueue) Pop() int {
    if len(this.outStack.data) == 0 {
        for len(this.inStack.data) > 0 {
            v := this.inStack.Pop()

            this.outStack.Push(v)
        }
    }

    v := this.outStack.Pop()
    return v
}


func (this *MyQueue) Peek() int {
    if len(this.outStack.data) == 0 {
        for len(this.inStack.data) > 0 {
            v := this.inStack.Pop()

            this.outStack.Push(v)
        }
    }

    v := this.outStack.Top()
    return v
}


func (this *MyQueue) Empty() bool {
    return this.inStack.Empty() && this.outStack.Empty()
}


/**
 * Your MyQueue object will be instantiated and called as such:
 * obj := Constructor();
 * obj.Push(x);
 * param_2 := obj.Pop();
 * param_3 := obj.Peek();
 * param_4 := obj.Empty();
 */
```