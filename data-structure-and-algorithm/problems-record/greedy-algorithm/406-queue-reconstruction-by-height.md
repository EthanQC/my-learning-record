## 406. 根据身高重建队列
### go：
```go
func lemonadeChange(bills []int) bool {
    five, ten := 0, 0

    for _, v := range bills {
        switch v {
            case 5:
                five++
            case 10:
                if five == 0 {
                    return false
                }
                five--
                ten++
            case 20:
                if ten > 0 && five > 0 {
                    ten--
                    five--
                } else if five > 2 {
                    five -= 3
                } else {
                    return false
                }
        }
    }
    return true
}
```