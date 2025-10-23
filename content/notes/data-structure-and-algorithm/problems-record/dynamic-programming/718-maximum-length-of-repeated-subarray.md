---
title: 718 maximum length of repeated subarray
date: '2025-09-03'
tags:
  - dynamic-programming
summary: >-
  for i := 1; i <= n; i++ { for j := m; j >= 1; j-- { if nums1[i - 1] == nums2[j
  - 1] { dp[j] = dp[j - 1] + 1
---
## 718. 最长重复子数组
### go：
```go
func findLength(nums1 []int, nums2 []int) int {
    n, m := len(nums1), len(nums2)
    dp, ans := make([]int, m + 1), 0

    for i := 1; i <= n; i++ {
        for j := m; j >= 1; j-- {
            if nums1[i - 1] == nums2[j - 1] {
                dp[j] = dp[j - 1] + 1

                if ans < dp[j] {
                    ans = dp[j]
                }
            } else {
                dp[j] = 0
            }
        }
    }

    return ans
}
```
