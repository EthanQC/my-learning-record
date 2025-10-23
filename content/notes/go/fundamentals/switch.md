---
title: switch
date: '2025-09-03'
tags:
  - fundamentals
summary: 在 Go 语言中，`switch` 语句是比传统的 `if–else` 更加简洁、灵活、功能丰富的多分支控制结构
---
在 Go 语言中，`switch` 语句是比传统的 `if–else` 更加简洁、灵活、功能丰富的多分支控制结构

## 基本语法
最简单的 `switch` 语法格式如下：

```go
switch 表达式 {
case 值1:
    // 当 表达式 == 值1 时执行
case 值2, 值3:
    // 当 表达式 == 值2 或 等于 值3 时执行
default:
    // 上面都不匹配时执行
}
```

`switch` 后可以跟一个 可选的初始化语句，格式如 `switch` 初始化; 表达式 { ... }，初始化语句只在当前 `switch` 中生效

如果没有 `default` 分支，且所有 `case` 都不匹配，则整个 `switch` 结束，相当于什么都不做

```go
switch x := compute(); x {
case 0:
    fmt.Println("zero")
case 1, 2:
    fmt.Println("one or two")
default:
    fmt.Println("other")
}
```

## 自动 `break` 与显式 `fallthrough`
与 C/C++ 不同，Go 的 `switch` 在匹配并执行完一个 `case` 后 不会 自动“穿透”到下一个 case，它会自动在每个 `case` 末尾执行一个 `break`

如果你确实需要“穿透”执行下一个 `case`，必须显式写 `fallthrough`：

```go
n := 2
switch n {
case 1:
    fmt.Println("1")
    fallthrough    // 强制继续执行下一个 case
case 2:
    fmt.Println("2")
case 3:
    fmt.Println("3")
}
// 输出：
// 2    （因为 n=2 时匹配 case 2，未落入前面的 case 1）
// 如果 n=1，则会输出：
// 1
// 2
```

要点：

* `fallthrough` 只会让控制流继续到下一个紧挨着的 `case`，不会再次做条件判断

* 在最后一个 `case` 使用 `fallthrough` 虽然语法允许，但没有后续分支可执行，一般应避免

## 无表达式（标签式）`switch`
`switch` 也可以不带表达式，这时它等价于 `switch true`，相当于一系列 `if–else if–else`：

```go
age := 25
switch {
case age < 13:
    fmt.Println("child")
case age < 20:
    fmt.Println("teenager")
case age < 65:
    fmt.Println("adult")
default:
    fmt.Println("senior")
}
```

这种写法常用于区间判断或需要多个条件组合的场合

各 `case` 会从上往下依次判断，匹配到第一个为 `true` 的就执行，之后自动 `break`

## 带初始化语句的 `switch`
在真正的项目中，我们常常需要先计算一个值再根据它做分支

Go 支持在 `switch` 语句中加一个初始化语句：

```go
switch today := time.Now().Weekday(); today {
case time.Saturday, time.Sunday:
    fmt.Println("Weekend!")
default:
    fmt.Println("Workday")
}
```

初始化语句和表达式之间用分号 `;` 分隔，初始化变量的作用域仅限于本次 `switch`

## 类型 `switch`（Type Switch）
当你有一个空接口变量，需要根据它的**动态类型**来分支时，使用类型 `switch` 十分方便：

```go
func describe(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Printf("int: %d\n", v)
    case string:
        fmt.Printf("string: %q\n", v)
    case bool:
        fmt.Printf("bool: %t\n", v)
    default:
        fmt.Printf("unknown type: %T\n", v)
    }
}
```

`i.(type)` 只能在 `switch` 中使用

`v` 会被赋值为对应分支的具体类型值，可以直接使用类型特有的方法和操作

## 与 `if–else` 的比较

|   | switch | if–else |
| --- | --- | --- |
| 语法 | 更简洁，专门处理多值匹配 | 需要多层 `else if`，可读性稍差 |
| 自动 `break` | 匹配后自动结束，无需显式 `break` | 每个分支天然结束 |
| 区间判断 | 需用无表达式 `switch` | 区间判断写作 `if a < x && x < b` |
| 类型判断| 支持类型 `switch` | 只能用 `if v, ok := i.(T); ok { … }` 逐个判断 |

## 常见用法示例
#### 命令行参数解析

```go
flag := os.Args[1]
switch flag {
case "-h", "--help":
    usage()
case "-v", "--version":
    fmt.Println("Version 1.0")
default:
    process(flag)
}
```

#### HTTP 状态码分类

```go
code := resp.StatusCode
switch {
case code >= 200 && code < 300:
    fmt.Println("Success")
case code >= 400 && code < 500:
    fmt.Println("Client error")
case code >= 500:
    fmt.Println("Server error")
default:
    fmt.Println("Other")
}
```

#### 动态类型处理

```go
var data interface{} = getData()
switch t := data.(type) {
case []byte:
    handleBytes(t)
case string:
    handleString(t)
default:
    log.Printf("Unsupported type: %T", t)
}
```

## 注意事项与最佳实践
#### 避免滥用 `fallthrough`
`fallthrough` 可能带来不可预料的逻辑错误，只有在非常明确的“多 `case` 链式执行”场景下才使用

#### 合理使用无表达式 `switch`
当条件判断不是简单的值比较，而是范围判断或函数返回 `bool` 时，无表达式写法既简洁又易读

#### 控制范围与变量作用域
初始化语句中声明的变量，作用域仅限于当前 `switch`，避免与外部同名变量混淆

#### 覆盖所有情况
对于枚举或有限可能值，最好提供 `default` 分支，或在缺省情况下抛出错误，保证代码健壮性

## 小结
Go 的 `switch` 比传统语言更加灵活：自动 `break`、支持类型判断、可声明初始化语句，并且可以省略表达式做无标签判断

正确掌握 `switch`，能够让你的代码更加简洁、可读性更高，也更易于维护

在实际项目中，结合场景合理选择普通 `switch`、无表达式 `switch` 和类型 `switch`，并谨慎使用 `fallthrough`
