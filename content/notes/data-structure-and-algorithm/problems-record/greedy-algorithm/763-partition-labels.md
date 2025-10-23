---
title: 763 partition labels
date: '2025-09-03'
tags:
  - greedy-algorithm
summary: >-
  res, start, end := make([]int, 0), 0, 0 for i := 0; i < len(s); i++ { if
  last[s[i] - 'a'] > end { end = last[s[i] - 'a'] } if i == end { res =
  append(res, end - start + 1) start =
---
## 763. 划分字母区间
### go：
```go
func partitionLabels(s string) []int {
    var last [26]int
    for i := 0; i < len(s); i++ {
        last[s[i] - 'a'] = i
    }

    res, start, end := make([]int, 0), 0, 0
    for i := 0; i < len(s); i++ {
        if last[s[i] - 'a'] > end {
            end = last[s[i] - 'a']
        }
        if i == end {
            res = append(res, end - start + 1)
            start = i + 1
        }
    }

    return res
}
```
