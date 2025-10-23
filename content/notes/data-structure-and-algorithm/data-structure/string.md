---
title: string
date: '2025-09-03'
tags:
  - data-structure
summary: 从最底层来看，字符串其实就是**一段有序的字符序列**（在计算机中通常用字节序列或 Unicode 码点序列来表示），并且会以某种方式标明“结束”或“长度”
---
## 字符串（String）概述
### 什么是字符串？

从最底层来看，字符串其实就是**一段有序的字符序列**（在计算机中通常用字节序列或 Unicode 码点序列来表示），并且会以某种方式标明“结束”或“长度”

在大多数编程语言里，字符串常常具备“可遍历”、“可查找”、“可截取”、“可拼接”等操作，不同语言会在底层实现和 API 设计上有差别，但本质都是对字符序列的抽象

### 字符串的基本特性

#### 可变 vs 不可变

可变字符串：可以在原有存储空间上修改字符、扩展长度等，比如 C 语言的 `char[]`（改动要小心缓冲区边界），或者 C++ 中的 `std::string`（可以往同一对象里 `append`）

不可变字符串：修改操作会返回一个新字符串，原对象保持不变，Go 中的 `string`、Java 中的 `String` 都属于不可变字符串

#### 编码与长度

在 `ASCII` 范围（0–127）内，**英文字符通常占用 1 个字节**；但如果涉及中文、Emoji 等非 `ASCII` 字符，就要考虑 Unicode（UTF-8）编码下一个字符可能占 `1–4` 个字节的问题

有些语言将“长度”视为“字节数”（如 Go 的 `len(s)` 返回的是底层字节长度）；有些 API 会单独提供以“字符（码点）”为单位的长度操作（如 Go 里可以先将字符串转换成 `[]rune` 再看长度）

#### 为什么字符串如此重要？

无论后端、前端、算法竞赛，还是实际项目开发，几乎所有场景都会用到字符串：从 URL 处理、日志解析，到用户输入、配置文件、网络协议，都离不开它

在算法/面试环节，字符串题型占比很高：反转、回文判断、子串匹配、最长公共前缀/子串、滑动窗口求解最长无重复子串、KMP 算法等，几乎是必考基础

## C++ 中的字符串
### C 风格字符串（C-String，`char*` / `char[]`）
#### 定义与特点
本质上是以 `\0`（ASCII 0）结尾的一段连续内存：

```cpp
char s1[] = "hello";       // 编译器会在末尾自动补 '\0'，数组长度为 6
char *s2 = "world";        // 指向不可修改的静态常量区
```

优点：

* 内存布局简单——连续字节，以 `\0` 结束

* 在底层更贴近 C 语言，对字节级操作友好

缺点：

* 必须注意是否有足够的空间来存放 `\0`：容易出现缓冲区溢出

* 很多操作都需要手动调用 `strlen()`、`strcpy()`、`strcat()` 等函数，容易引发安全问题

* 在算法题中，直接操作 C 风格字符串比 `std::string` 更繁琐，错误率较高

#### 典型操作示例

计算长度：`size_t len = strlen(s1)`

复制（存在溢出风险，要保证目标缓冲区足够大）：

```cpp
char dest[20];
strcpy(dest, s1);  // 把 "hello" 拷贝到 dest 数组中
```

拼接：`strcat(dest, s2)`

比较：`strcmp(s1, s2)` 返回 `<0`、`=0`、`>0` 三种情况

现代 C++ 更倾向于使用 `std::string`，只有在与 C 库或性能极端敏感时才使用 C 风格字符串

### C++ 标准库字符串：`std::string`
#### 基本概念与底层实现
##### `std::string` 是什么？

从 C++98 到 C++11 之后，`std::string` 就是对字符序列的一种封装，底层一般是一个管理动态内存的类（从 C++11 起要求底层存储是连续的，比如 `&str[0]` 能取到内部的 `char*` 指针）

它会自己维护长度、容量、并负责分配和释放内存

##### 底层实现要点（以常见的 `libstdc++` / `libc++` 实现为例）

* 连续内存：

  * 内存布局大致是：`[指向字符数组的指针]  [当前长度 size]  [当前容量 capacity]  [实际字符数组 ... ]`

  * C++11 明确要求 `std::string` 存储是连续的（可以直接传给需要 `char*` 的 C API）

* Small String Optimization（SSO）小型字符串优化

  * 许多实现会为短字符串（比如长度 ≤ 15）在对象内部直接预留一个 16 字节的缓冲区，这样就无需堆分配，拷贝开销更小

  * 当字符串长度超过内部缓冲区时，才会调用 `new char[n]` 去堆上分配空间

* 长度与容量

  * `size()` 返回当前存储的字符数（不包括末尾的 `\0`）

  * `capacity()` 返回当前底层缓冲区能容纳的最大字符数（也不算末尾的 `\0`）

  * 当拼接或插入导致 `size() + 1 > capacity()` 时（+1 是给 `\0` 留位置），会触发重新分配——通常是按某个倍增策略（如 1.5× 或 2×）扩大容量

* 移动语义（C++11+）

  * 支持右值引用和移动构造，使得把临时字符串赋值给 `std::string` 时可直接“搬移”内部指针，而不是深拷贝，性能更好

#### 常用 API 和操作
##### 构造与赋值

```cpp
std::string s1;                     // 空字符串
std::string s2("hello");            // 从 C 字符串构造
std::string s3(s2);                 // 拷贝构造
std::string s4(s2, 1, 2);           // 从 s2[1] 开始截取 2 个字符，结果为 "el"
std::string s5(5, 'A');             // 生成 "AAAAA"
std::string s6 = std::move(s2);     // 移动构造，s2 可能成为空
```

##### 访问字符

```cpp
char c = s1[0];                     // 不做边界检查，若越界则行为未定义
char d = s1.at(0);                  // 做边界检查，越界会抛出 std::out_of_range
```

##### 拼接与插入

```cpp
s1 += " world";                     // 在末尾拼接 C 字符串
s1.append("abc", 2);                // 只拼接前 2 个字符 -> 'a','b'
s1.insert(3, "XYZ");                // 在下标 3 处插入 "XYZ"
```

##### 删除与替换

```cpp
s1.erase(2, 3);                     // 从下标 2 开始删除 3 个字符
s1.replace(1, 2, "QQ");             // 从下标 1 开始替换 2 个字符为 "QQ"
```

##### 查找与子串

```cpp
size_t pos = s1.find("lo");         // 查找子串 "lo" 出现的第一个位置。若找不到返回 npos
std::string sub = s1.substr(2, 4);  // 从下标 2 开始截取 4 个字符
size_t rpos = s1.rfind("o");        // 反向查找
```

##### 比较

```cpp
if (s1 == s2) { ... }
int cmp = s1.compare(s2);           // 返回 <0、=0 或 >0，语义同 strcmp
```

##### IO 操作

```cpp
std::getline(cin, s1);              // 读入一整行（包含空格）
std::cout << s1 << std::endl;       // 输出字符串
```

##### 容量管理

```cpp
size_t len = s1.size();             // 当前长度
size_t cap = s1.capacity();         // 当前容量
s1.reserve(100);                    // 预先分配至少能容纳 100 字符的空间
s1.shrink_to_fit();                 // 尝试将容量收缩到等同于长度
```

##### 迭代器（可遍历）

```cpp
for (auto it = s1.begin(); it != s1.end(); ++it) {
    // *it 类型为 char
}
for (char ch : s1) {
    // 范围-based for
}
```

##### C 兼容接口

```cpp
const char *cstr = s1.c_str();      // 返回以 '\0' 结尾的 C 风格字符串指针
char *data = s1.data();             // C++17 之前不能修改，C++17 起可以修改 data()[i]
```

#### 性能考量与技巧
##### 避免频繁的小规模拼接

* 如果在循环中 `s += char、s += "x"`，会不断地触发动态扩容，影响性能，建议在知道最终大概长度时事先 `reserve()`

* 若要进行大量拼接也可以使用 `std::ostringstream` 或者 C++20 的 `std::string::operator+=` 已经得到优化，但在特殊场景下，手动一个 `std::string buf; buf.reserve(…)` 再拼接，性能更有保障

##### 移动语义（Move）

* 当函数返回一个局部构造的 `std::string` 时，利用返回值优化（RVO）或移动构造，都避免深拷贝

* 如果要把一个现有字符串传给另一个不再使用的变量，可以 `std::string t = std::move(s);`，将 `s` 的内部缓冲区“搬运”过去，避免拷贝开销

##### 尽量使用 const & 作为函数参数

如果函数只需要读取字符串，不打算修改，且入参是已存在的 `std::string`，请使用 `void foo(const std::string &s)` 而非 `void foo(std::string s)`，这样避免了拷贝

##### 与 C 风格字符串相互转换时要注意

* `std::string` 转 `const char*`：只需 `s.c_str()`，注意得到的是只读指针

* `const char*` 转 `std::string`：可直接 `std::string t = "abc";` 或 `std::string t(some_cstr);`

* 别在 `const char*` 指向的字符串被销毁后还使用 `string::c_str()` 返回的指针

##### 字符编码问题

`std::string` 本身只是“字节序列”，并不关心编码，若要处理 UTF-8 等多字节编码，需要额外使用第三方库（如 iconv、utfcpp）或者自己按字节解析

在面试时一般只需假设输入恰为 ASCII，除非题目特别说明要支持 Unicode

## Go（Golang）中的字符串
Go 语言自发布以来因简洁、高效、并发友好而广受欢迎，它对字符串的设计与 C++ 有很大不同

### Go 中 string 类型的本质
#### 字符串在 Go 中是不可变的

Go 里 `string` 本质上是一个只读的字节切片：

```go
type stringHeader struct {
    Data uintptr // 指向底层字节数组的指针
    Len  int     // 字节数
}
```

由于不可变，**任何修改操作（拼接、替换、删除等）都会产生一个新的底层字符串，原字符串保持不变**

这种不可变性使得**字符串在并发场景下非常安全**，但也要注意频繁拼接会导致大量临时对象，影响 GC 性能

#### 底层编码为 UTF-8

Go 默认使用 UTF-8 编码存储字符串，一个 Unicode 码点（`rune`）在底层可能占 1–4 个字节

`len(s)` 返回的是**字节长度**，不是“字符（码点）数量”，如果要以“字符”为单位遍历或计算长度，需要先把 `s` 转成 `[]rune`

#### 与 `[]byte`、`[]rune` 的关系

* `[]byte(s)`：会把字符串拷贝为一个新的**字节切片**（占用额外内存），常用于底层二进制处理

* `[]rune(s)`：会把字符串按 UTF-8 解码为 `rune`（即 `int32` 类型），这样对中文或多字节字符操作更方便

即前者主要用于对单个字母的操作，后者则主要用于对汉字、emoji等 Unicode 码进行操作

### Go 中常见的字符串操作
#### 创建与拼接

```go
var s1 string = "hello"
s2 := "world"
s3 := s1 + " " + s2           // "hello world"，实际会在底层分配新空间

// 大量拼接时推荐使用 strings.Builder
var builder strings.Builder
builder.WriteString("hello")
builder.WriteByte(' ')
builder.WriteString("world")
s4 := builder.String()        // 性能更优，减少临时分配
```

#### 遍历与索引

**按字节遍历（不适合 Unicode 场景，只适合 ASCII 字符串）**：

```go
for i := 0; i < len(s1); i++ {
    b := s1[i]              // b 是一个 byte
    // 不能直接当字符输出，需要转换：fmt.Printf("%c", b)
}
```

**按 Unicode 码点遍历（推荐）**：

```go
for idx, r := range s1 {
    // idx 是对应字符在 s1 中的字节偏移量，r 是 rune 类型（Unicode 码点）
    fmt.Printf("字符：%c，起始字节索引：%d\n", r, idx)
}
```

直接用 `for i, ch := range s1` 会按照“码点”遍历，`ch` 类型是 `rune`

#### 常用函数（`strings` 包）

```go
import "strings"

strings.Contains(s, substr)              // 判断 s 是否包含 substr
strings.HasPrefix(s, prefix)             // 是否以 prefix 开头
strings.HasSuffix(s, suffix)             // 是否以 suffix 结尾
strings.Index(s, substr)                 // 返回 substr 第一次出现的字节索引，找不到返回 -1
strings.LastIndex(s, substr)             // 返回最后一次出现的位置
strings.Split(s, sep)                    // 按 sep 分割，返回 []string
strings.Join(slice, sep)                 // 把 slice 中的字符串以 sep 拼接起来
strings.Replace(s, old, new, n)          // 把 s 中的 old 替换为 new，n 次，n<0 表示全部替换
strings.ToUpper(s)、strings.ToLower(s)   // 大小写转换
strings.TrimSpace(s)                     // 去除首尾空白（空格、制表符、换行等）
strings.Fields(s)                        // 按空白字符分割，返回非空单词切片
```

`bytes` 包里也有对应的 `bytes.Contains`、`bytes.Split` 等函数，使用方式与 `strings` 类似，只不过操作对象是 `[]byte`

#### 格式化与构造
`fmt.Sprintf`：与 C++ 中的 `sprintf` 类似，但底层更安全，性能次于 `strings.Builder`

```go
str := fmt.Sprintf("Name: %s, Age: %d", name, age)
```

`strconv` 包：字符串与数字互转

```go
import "strconv"
i, err := strconv.Atoi("123")   // string -> int
s := strconv.Itoa(456)          // int -> string
f, err := strconv.ParseFloat("3.14", 64)
fs := strconv.FormatFloat(f, 'f', 2, 64) // "3.14"
```

#### 字符串与 Unicode

如果仅仅用 `len` 得到的是字节数，不是“字符数”

```go
s := "你好"
fmt.Println(len(s))     // 输出 6，因为 "你"、"好" 各占 3 个字节（UTF-8）
fmt.Println(len([]rune(s))) // 输出 2，表示两个 Unicode 码点
```

**反转字符串时，必须先把它转换成 `[]rune`，否则中文字符会被拆成多个字节，导致乱码**

```go
func reverseString(s string) string {
    runes := []rune(s)
    i, j := 0, len(runes)-1
    for i < j {
        runes[i], runes[j] = runes[j], runes[i]
        i++; j--
    }
    return string(runes)
}
```


## 小结与建议
#### 语言选型依据

如果面试强调“算法与数据结构”，C++ 因其底层可控性、成熟的 STL，以及面试官常以 C++ 为例，通常更受青睐

如果面试侧重“后端工程能力”或“微服务开发”，Go 会是更符合场景的选择，尤其在云原生架构里使用率极高

#### 掌握基础后再深入优化

不管是 `std::string` 还是 `Go string`，都要先掌握基本操作及常见 API

之后再关注性能优化：C++ 要考虑 `reserve()`、移动语义、SSO；Go 要关注不可变特性带来的临时分配，并学会使用 `strings.Builder`、`bytes.Buffer`

#### 面试时的沟通策略

先说明思路：在写代码前，先向面试官阐述清晰的思路、时间复杂度和空间复杂度

边界条件：空字符串、全部相同字符、非 ASCII、大小写敏感/不敏感等一定要在思路里提及

API 的选择：如果题目没有特别要求，可以先用标准库里一个函数解决（如 find、Index），然后补充“若考察手写算法，再实现 KMP/Rabin-Karp/Trie 等”

清晰书写：变量命名中英文混用要慎重，中文注释尽量在代码注释里简单说明（如果是在线面试环境，还是尽量写英文注释或无注释，口头补充说明即可）
