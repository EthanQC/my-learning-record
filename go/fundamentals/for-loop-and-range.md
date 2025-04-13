## for 循环和 range 关键字
在 Go 语言中，循环结构只有一种关键字—— `for`

通过不同的写法和变体，`for` 能够完成所有循环需求

其中最常用的两种形式是**传统的 `for` 循环**（类似其他语言里的 `for` 循环或 while 循环）和 **`range` 形式**（主要用于遍历数组、切片、字符串、map 和通道）

### 传统的 `for` 循环
#### 基本语法
Go 语言中最常见的 `for` 循环写法与 C 语言类似，形式如下：

    for initialization; condition; post {
        // 循环体
    }

* **initialization**：初始化语句，只在循环开始前执行一次（如：声明并赋值一个计数器）
* **condition**：循环条件，每次循环开始前都会判断，如果条件为 true，则执行循环体，否则退出循环
* **post**：循环后语句，每次循环体执行结束后自动执行（如：计数器递增）

示例：

    for i := 0; i < 10; i++ {
        fmt.Println("当前 i =", i)
    }

在这个例子中，i 从 0 开始，每次循环后 i++，直至 i < 10 不成立，循环退出

#### 省略部分语法
Go 的 `for` 循环**允许省略三个部分中的任意部分**，这里有几种常见的变体：

##### 类 while 循环
如果省略初始化和后置语句，则可以将 for 用作 while 循环，其语法形式：

    i := 0
    for i < 10 {
        fmt.Println("i =", i)

        i++  // 手动更新变量
    }
    
这种写法类似于其他语言中的 `while` 循环，条件为 i < 10，注意**更新变量的逻辑需要写在循环体内**，否则可能陷入无限循环

##### 无限循环
如果省略所有三个部分，便可以构造一个无限循环：

    for {
        // 无限循环体
        // 通常需要在循环内调用 break 或 return 跳出循环
    }

无限循环在**服务器、事件循环、定时任务**等场景中比较常用

正确使用时，一般会**在循环体内用 `break` 或 `return` 来跳出循环**

#### 控制循环流程
在 for 循环中，还可以使用以下关键字控制循环流程：

* `break`：用于**立即退出当前循环**
* `continue`：用于**跳过当前循环余下的部分，直接进入下一次循环**
* `goto`：尽量不推荐使用，但在某些场景下也可以用来**转移到指定标签处**

示例：

    for i := 0; i < 10; i++ {
        if i == 5 {
            continue  // 当 i == 5 时，跳过本次循环
        }

        if i == 8 {
            break  // 当 i == 8 时，退出整个循环
        }

        fmt.Println(i)
    }

### `range` 关键字
`range` 是 Go 专门用于**遍历数据结构**（如数组、切片、字符串、map 和通道）的语法糖

使用 `range` 循环时，可以**在每次迭代中获得每个元素的值，以及该元素的索引或键**（取决于被遍历的数据结构）

#### 数组和切片
##### 基本语法

    for index, value := range arrOrSlice {
        // index 为索引，value 为对应的值
    }
    
如果不需要索引，可以使用**下划线** `_` 省略：

    for _, value := range arrOrSlice {
        fmt.Println(value)
    }

同样，如果**只需要索引**，可以**只写一个变量**：

    for index := range arrOrSlice {
        fmt.Println("索引：", index)
    }

示例：

    nums := []int{10, 20, 30, 40}

    for i, num := range nums {
        fmt.Printf("下标：%d, 数值：%d\n", i, num)
    }

> 其中，`%d` 是用来打印十进制整数的占位符，`/n` 是换行符，表示在输出后换行

#### 字符串
遍历字符串时，`range` 会**按照 Unicode 码点（rune）来遍历**，并返回字符的索引和字符本身

    str := "你好, Go!"

    for index, char := range str {
        fmt.Printf("字符索引：%d, 字符：%c\n", index, char)
    }

> 其中，`%c` 是用来打印单个字符的占位符，适用于 rune 类型或 Unicode 码点
>
> 也就是说如果传入整数，会被解释为码点然后打印对应的字符（65 -> A）

注意：
* 字符串里的每个“字符”可能包含**多个字节**（尤其是非 ASCII 字符）
* index 返回的是**字节索引**，而非字符数量的索引

#### `map`
遍历 `map` 时，`range` 返回键和值，顺序是**不确定的**（`map` 的遍历顺序是**随机**的）

    m := map[string]int{
        "apple":  1,
        "banana": 2,
        "orange": 3,
    }

    for key, value := range m {
        fmt.Printf("键：%s, 值：%d\n", key, value)
    }

> 其中 `%s` 是用来打印字符串类型变量的占位符

### `range` 与传统 `for` 循环的区别和适用场景
#### 适用场景
##### 传统 `for` 循环：
当你需要**操作循环变量**（如需手动控制循环计数、跳出循环、或修改计数器）或需要**根据下标进行随机访问**时，传统 for 循环非常适合

例如遍历时需要修改数组中某些元素的位置或顺序

##### `range` 循环：
对于**只需要遍历集合中每个元素**，并且**不关心具体下标**（或下标只是辅助信息）的情况，`range` 循环更为简洁和安全

特别是遍历数组、切片、字符串、`map` 时，`range` 能**自动处理边界和长度问题**

#### 注意点
##### 值拷贝问题
对于**数组、切片、字符串**等数据类型，使用 `range` 得到的元素是**值的拷贝**

如果你需要在循环体内修改切片中的元素，可能需要使用**索引访问**来进行修改

示例：

    // 错误示范：修改不会反映到原始切片中
    nums := []int{1, 2, 3, 4}

    for _, num := range nums {
        num = num * 2 // 这里只是修改了拷贝
    }

    fmt.Println(nums) // 结果依然是 [1 2 3 4]

    // 正确方法：使用索引
    for i := range nums {
        nums[i] = nums[i] * 2
    }

    fmt.Println(nums) // 结果是 [2 4 6 8]

##### 循环顺序
对于 `map`，`range` 循环遍历顺序不固定，尤其 `map` 顺序随机，如果有顺序要求需要**额外排序**或使用其他数据结构

##### 遍历字符串时的索引
对于字符串，`range` 返回的是**字节索引**，如果需要对每个 rune 做一些操作，注意**不要把索引当作字符位置**

### 综合示例
以下是一个包含多种循环写法的完整示例，展示了传统 `for` 循环与 `range` 的用法：

    package main

    import (
        "fmt"
    )

    func main() {
        // 传统 for 循环示例
        fmt.Println("传统 for 循环：")

        for i := 0; i < 5; i++ {
            if i == 3 {
                continue  // 跳过 i==3 的情况
            }

            fmt.Println("i =", i)
        }

        // 类似 while 的 for 循环
        fmt.Println("\nwhile 风格的 for 循环：")

        j := 0
        for j < 5 {
            fmt.Println("j =", j)

            j++
        }

        // 无限循环 + break 示例
        fmt.Println("\n无限循环示例：")

        k := 0
        for {
            fmt.Println("k =", k)
            k++

            if k >= 3 {
                break
            }
        }

        // range 遍历切片
        fmt.Println("\nrange 遍历切片：")

        nums := []int{10, 20, 30, 40}
        for i, num := range nums {
            fmt.Printf("索引：%d, 数值：%d\n", i, num)
        }

        // range 遍历字符串
        fmt.Println("\nrange 遍历字符串：")

        s := "Hello, 世界"
        for i, ch := range s {
            fmt.Printf("索引：%d, 字符：%c\n", i, ch)
        }

        // range 遍历 map
        fmt.Println("\nrange 遍历 map：")

        m := map[string]int{"apple": 5, "banana": 3, "orange": 8}
        for key, value := range m {
            fmt.Printf("键：%s, 值：%d\n", key, value)
        }
    }

### 总结
传统 `for` 循环适用于需要精确控制初始化、条件和迭代操作的场景，能够轻松实现类似 C 语言的 `for` 循环、`while` 循环或无限循环

`range` 循环是 Go 的语法糖，能简化对数组、切片、字符串、`map` 的遍历，能自动提供索引和副本，便于快速迭代，但需要注意数据是否为拷贝（尤其是需要修改原数据时）