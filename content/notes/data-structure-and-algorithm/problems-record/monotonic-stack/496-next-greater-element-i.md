## 496. 下一个更大元素 I
### go：
```go
func nextGreaterElement(nums1 []int, nums2 []int) []int {
    stack, next := make([]int, len(nums2)), make(map[int]int, len(nums2))

    for _, x := range nums2 {
        for len(stack) > 0 && x > stack[len(stack) - 1] {
            v := stack[len(stack) - 1]
            stack = stack[: len(stack) - 1]
            next[v] = x
        }
        stack = append(stack, x)
    }
    for len(stack) > 0 {
        v := stack[len(stack) - 1]
        stack = stack[: len(stack) - 1]
        next[v] = -1
    }

    ans := make([]int, len(nums1))
    for i, v := range nums1 {
        if ng, ok := next[v]; ok {
            ans[i] = ng
        } else {
            ans[i] = -1
        }
    }

    return ans
}
```