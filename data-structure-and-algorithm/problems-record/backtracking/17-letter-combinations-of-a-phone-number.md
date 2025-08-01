## 17. 电话号码的字母组合
### go：
```go
func letterCombinations(digits string) []string {
    if len(digits) == 0 {
        return nil
    }

    mapping := map[byte]string{
        '2': "abc",
        '3': "def",
        '4': "ghi",
        '5': "jkl",
        '6': "mno",
        '7': "pqrs",
        '8': "tuv",
        '9': "wxyz",
    }

    var results []string
    var path []byte
    backtrack(&results, path, mapping, 0, digits)

    return results
}

func backtrack(results *[]string, path[]byte, mapping map[byte]string, pos int, digits string) {
    if pos == len(digits) {
        *results = append(*results, string(path))
        return
    }

    letters := mapping[digits[pos]]
    for i := 0; i < len(letters); i++ {
        path = append(path, letters[i])
        backtrack(results, path, mapping, pos + 1, digits)
        path = path[: len(path) - 1]
    }
}
```