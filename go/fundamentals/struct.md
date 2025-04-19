在 Go 语言中，`struct`（结构体）是一种最常用、最基础的复合数据类型，用来**将若干个不同类型或相同类型的字段组合在一起**，形成一个新的整体

### 什么是 `struct`
`struct` 是 Go 里**最接近于“类”的一种类型**，但它本身不包含继承，只有组合（embedding）

它把多个字段封装成一个逻辑整体，用来描述“具有这些属性的对象”

典型应用：

* 在网络编程里，你可能会用一个 `struct` 来表示一个 HTTP 请求
* 在业务逻辑里，你会用 `struct` 来表示一个用户（User）、一笔订单（Order）或一条日志（LogEntry）等

### 定义与基本语法
一个最简单的结构体定义示例如下：

    // 定义一个表示“点”的结构体
    type Point struct {
        X int
        Y int
    }

**关键字 `type`**：告诉编译器我们要定义一个新类型

`Point`：新类型的名字（**导出类型第一个字母必须大写，否则在包外不可见**）

`struct { … }`：真正的结构体定义体，包含若干条字段名和字段类型

### 字段（`Fields`）
##### 字段名称：
由字母、数字和下划线组成，首字母大小写区分导出与否

##### 字段类型：
可以是基本类型（int、string）、指针、切片、地图、函数、接口，甚至其他 `struct`

##### 访问：
如果你在包外访问某个 `struct` 的字段，它必须导出（首字母大写）

例如，`Point.X`、`Point.Y` 可访问，但如果写成 `x, y int` 就只能在定义它的包内访问

### 初始化结构体
#### 零值初始化

    var p Point   // p.X == 0, p.Y == 0

所有字段都被自动赋予对应类型的“零值”：

* 数值类型为 0
* 布尔为 false
* 字符串为 ""
* 指针／切片／map 为 nil

#### 字面量初始化

    // 按字段顺序初始化
    p1 := Point{10, 20}

    // 指定字段名初始化（顺序可任意）
    p2 := Point{Y: 5, X: 3}

    // 只初始化部分字段，剩下自动零值
    p3 := Point{X: 7}  // p3.Y == 0

#### `new` 与 `&`

    p4 := new(Point)   // 返回 *Point，等价于 &Point{}
    // p4.X == 0, p4.Y == 0
    
### 嵌入（`Embedding`）与匿名字段
Go 的 `struct` 支持“匿名字段”或“嵌入”，可以**把另一个类型直接嵌入到结构体里**，类似于组合：

    type Color struct { R, G, B int }

    type Vertex struct {
        X, Y int
        Color    // 匿名字段，类型为 Color
    }

通过 `v.Color.R` 访问，也可以直接 `v.R`

### 方法（`Methods`）与接收者（`Receiver`）
在 Go 中，你可以为任意自定义类型（包括 `struct`）定义方法：

    // 值接收者
    func (p Point) DistanceToOrigin() float64 {
        return math.Hypot(float64(p.X), float64(p.Y))
    }

    // 指针接收者（可以修改调用者）
    func (p *Point) Translate(dx, dy int) {
        p.X += dx
        p.Y += dy
    }

* **值接收者**：方法内部操作的是字段的拷贝，无法修改原对象
* **指针接收者**：可以在方法中修改调用者本身，也避免了大结构体在调用时的拷贝开销

### 结构体与指针
`Point` vs `*Point`：前者是值类型，后者是引用类型，传递时会复制整个结构体大小

在函数签名或方法接收者中，若你要修改结构体中的字段，一定要用 `*Point`，若只读访问，用 `Point` 值接收者更自然

### 标签（`Tags`）
结构体字段可以附加“标签”，通常用于**序列化／反序列化**：

    type User struct {
        ID   int    `json:"id"`
        Name string `json:"name,omitempty"`
        Age  int    `db:"age"`
    }

* **语法**：在字段类型后面加反引号 `key:"value"`
* **用途**：常见于 `encoding/json`、`database/sql`、`gopkg.in/yaml.v2 `等库，通过反射读取这些标签来控制行为

### 反射（`Reflection`）
如果你需要在运行时动态地读取结构体的字段名、标签或类型，可以用 `reflect` 包：

    t := reflect.TypeOf(User{})
    for i := 0; i < t.NumField(); i++ {
        f := t.Field(i)
        fmt.Println(f.Name, f.Tag.Get("json"))
    }

### 比较与零值
##### 可比较性：
只有当所有字段本身都是可比较的（`==` 可用）时，此结构体才可以直接做 `==` 或作为 `map` 的 `key`

##### 零值可用性：
零值就能工作，不需要显式的构造函数，你可以直接用 `var` 或 `new` 得到一个可用的空结构体

### 内存布局与对齐
Go 会根据字段声明顺序进行内存对齐，可能在字段之间插入填充字节，以满足 CPU 的对齐要求

如果关心结构体大小，可将**大类型字段放前面，小类型放后面**，尽量减少内存浪费

### 嵌套结构体
你可以在结构体中再定义结构体字段：

    type Address struct {
        City, State string
    }

    type Employee struct {
        Name    string
        Addr    Address
        Manager *Employee
    }

这样就能表达更复杂的关联关系，例如递归引用

### 构造模式与工厂函数
Go 没有构造函数的语法，但你可以写一个“工厂函数”来封装初始化逻辑：

    func NewUser(id int, name string) *User {
        return &User{ID: id, Name: name}
    }

### 实践建议
* **导出 vs 非导出**：
    * 首字母大写的字段和类型会被包外可见，用于公共 API
    * 小写字段仅限包内
* **方法接收者一致**：
    * 同一类型的方法要么全部使用值接收者
    * 要么全部使用指针接收者，避免混淆
* **避免过度嵌入**：
    * 结构体嵌入要有清晰意图
    * 别把所有类型都随意嵌进去，否则可读性会下降
* **标签命名**：
    * 尽量为常用的序列化库添加标签（如 `json:"..."`），保持一致