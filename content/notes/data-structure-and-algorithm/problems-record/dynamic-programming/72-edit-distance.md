---
title: 72 edit distance
date: '2025-09-03'
tags:
  - dynamic-programming
summary: '// 空串 -> word2[:j]：插 j 次 for j := 0; j <= m; j++ { dp[j] = j }'
---
## 72. 编辑距离
### go：
```go
func minDistance(word1, word2 string) int {
    m := len(word2)
    dp := make([]int, m+1)

    // 空串 -> word2[:j]：插 j 次
    for j := 0; j <= m; j++ {
        dp[j] = j
    }

    for i := 0; i < len(word1); i++ {
        x := word1[i]

        // 本行的 dp[0]：把前 i+1 个字符变成空串，必须删 i+1 次
        prev := dp[0] // 更新前的 dp[0]，给 j=1 的“替换/对齐”用
        dp[0] = i + 1

        for j := 1; j <= m; j++ {
            old := dp[j] // 还没用 x 之前的代价（支持“删”）

            if x == word2[j-1] {
                // 对齐到同一字符：直接承接“上一步的 j-1”
                dp[j] = prev
            } else {
                // 三种操作取最小
                del := old + 1       // 删 x
                ins := dp[j-1] + 1   // 插 word2[j-1]
                rep := prev + 1      // 换 x -> word2[j-1]
                // 取最小
                if del > ins { del = ins }
                if del > rep { del = rep }
                dp[j] = del
            }

            prev = old // 滚动“上一刻的 j”，给下一列当 prev
        }
    }
    return dp[m]
}
```
