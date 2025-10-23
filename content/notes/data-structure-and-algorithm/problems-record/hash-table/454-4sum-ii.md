## 454. 四数相加 II
### go：

```go
func fourSumCount(nums1 []int, nums2 []int, nums3 []int, nums4 []int) int {
    sum12 := make(map[int]int, len(nums1))

    for _, x := range nums1 {
        for _, y := range nums2 {
            sum := x + y
            sum12[sum]++
        }
    }

    count := 0

    for _, x := range nums3 {
        for _, y := range nums4 {
            target := -(x + y)

            if freq, ok := sum12[target]; ok {
                count += freq
            }
        }
    }

    return count
}
```