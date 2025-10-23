---
title: context
date: '2025-09-03'
tags:
  - fundamentals
summary: '官方文档：https://pkg.go.dev/context'
---
官方文档：https://pkg.go.dev/context

在 Go 语言中，`context` 包提供了一种在 `goroutine` 之间**传递取消信号、超时/截止日期和请求范围内值的标准化机制**，自 Go 1.7 起，它已成为构建**可取消、可超时、可追踪请求**的基础设施

## 设计理念与作用
#### 取消信号传递
在多 `goroutine` 协作时，一个上游操作（如 HTTP 请求）如果被取消，**下游关联的所有操作都应及时退出**，避免资源泄漏

#### 超时/Deadline 管控
支持为一系列操作统一设置超时或截止日期；一旦超时，**下游操作能自动感知并停止**

#### 请求作用域的数据传递
允许在请求生命周期内传递一些元数据（如用户 ID、TraceID 等），而**不需要显式地将这些参数在每层函数签名中往返传递**

总体来说，`context` 是一种“上游可控、下游可观察”的**信号与数据流通道**

## 核心接口与方法

```go
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    Done() <-chan struct{}
    Err() error
    Value(key interface{}) interface{}
}
```

#### `Deadline()`
返回：截止时间（`time.Time`）和一个 `bool`（表示是否设置了 deadline）

#### `Done()`
返回一个**只读**的 `channel`，当 `context` 被取消或 `deadline` 到达时，`channel` 会被关闭

下游可通过 `<-ctx.Done()` 或 `select` 来感知取消信号

#### `Err()`

当 `Done()` 通知后，`Err()` 会返回具体原因：

* `context.Canceled`（主动调用 `CancelFunc`）

* `context.DeadlineExceeded`（超时/ `Deadline` 到达）

#### `Value(key interface{}) interface{}`

用于读取和传递上下文中存储的键值对

推荐使用**自定义不可导出的类型作为 key**，避免冲突

## 构造函数与派生 `Context`
#### 根 `Context`
##### `context.Background()`
返回一个空的、永不取消、无超时、无值的根 `Context`；一般用于 main、tests 或顶层请求

##### `context.TODO()`
表示“还没确定用哪个 `Context`”，是一个占位符，编写中可先用 `TODO`，后续再改

#### 派生 `Context`
##### `WithCancel`

```go
ctx, cancel := context.WithCancel(parentCtx)
// 调用 cancel() 会关闭 ctx.Done()
```

##### `WithTimeout`

```go
ctx, cancel := context.WithTimeout(parentCtx, 500*time.Millisecond)
// 等价于先 WithDeadline(now+duration)
```

##### `WithDeadline`

```go
dl := time.Now().Add(2 * time.Hour)
ctx, cancel := context.WithDeadline(parentCtx, dl)
```

##### `WithValue`

```go
type userKey struct{}  // 自定义 key 类型
ctx2 := context.WithValue(parentCtx, userKey{}, userID)
```

注意：除了 `WithValue` 之外，其它派生都会返回一个 `cancel` 函数，调用后会释放底层资源（关闭 `Done()` 通知下游退出）

务必在函数结束前调用 `cancel()`，即使不关心立即取消，也能避免内存泄漏

## 取消与超时的传播
```go
func doWork(ctx context.Context) {
    select {
    case <-time.After(2 * time.Second):
        fmt.Println("work done")
    case <-ctx.Done():
        fmt.Println("work canceled:", ctx.Err())
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    doWork(ctx)
}

// 输出：work canceled: context deadline exceeded
```

#### 层层向下传播
派生的 `Context` 会嵌套持有上游 `Context`

当上游被取消或超时，下游所有 `Done()` 都会被触发

#### `select` 实现
在长耗时或阻塞操作中，务必将 `<-ctx.Done()` 放入 `select`，及时响应取消

## 值（Value）的传递与使用

```go
type traceIDKey struct{}
func handler(ctx context.Context) {
    // 从 HTTP Header 中取 TraceID
    traceID := ctx.Value(traceIDKey{}).(string)
    log.Printf("start handling trace=%s", traceID)
    //...
}
func main() {
    root := context.Background()
    ctx := context.WithValue(root, traceIDKey{}, "abc123")
    handler(ctx)
}
```

* 用途

  * 在请求上下文中透传一些元数据，如用户认证信息、TraceID、数据库事务对象等

* 限制

  * 不要把大量数据或业务结构体放进 `Context`；只用于轻量级、可选的 `request-scoped` 数据

  * key 应该是私有类型，避免与第三方库或其他包冲突

  * 读取要做类型断言，并做好类型检查

## 实际使用示例：HTTP Server

```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 从请求头提取 TraceID，没有则生成
        traceID := r.Header.Get("X-Trace-ID")
        if traceID == "" {
            traceID = uuid.New().String()
        }
        // 将 TraceID 放入 Context
        ctx := context.WithValue(r.Context(), traceIDKey{}, traceID)
        // 用带 cancel 的 Context 保护整个请求链路，超时 10s
        ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
        defer cancel()

        // 用新 Context 构造新的 Request
        r2 := r.WithContext(ctx)
        log.Printf("start req trace=%s, url=%s", traceID, r.URL.Path)
        next.ServeHTTP(w, r2)
        log.Printf("end req trace=%s", traceID)
    })
}
```

中间件层：为每个请求生成或传入 `Context`，并绑定超时与 TraceID

业务层：只需通过 `r.Context()` 获取当前请求上下文，传给数据库、RPC 客户端等

## 常见误区与最佳实践
#### 忘记调用 `cancel`

只有 `WithCancel` / `WithDeadline` / `WithTimeout` 会返回 `cancel`，务必 `defer cancel()`

#### 在 `goroutine` 内派生无意义的 `Context`

尽量让最接近「请求起点」的那一层创建 `Context`，其它地方通过参数传递

#### 滥用 `WithValue`

`Context` 不是通用的全局存储；只存放请求级别的少量数据

#### 误以为 `Context` 会暂停或拦截阻塞调用

`Context` 只是提供取消信号，实际阻塞调用（如 `time.Sleep`、`net.Conn.Read`）需要自己在 `select` 中结合 `ctx.Done()`

## 小结
`context` 是 Go 生态中处理超时、取消、元数据传递的标准化方案

核心在于层层派生的 `Context` 之间，借助 `Done()` 通道和 `Err()` 错误实现统一的取消/超时通知

常用函数：

* `context.Background()`, `context.TODO()`

* `WithCancel`, `WithTimeout`, `WithDeadline`, `WithValue`

最佳实践：

* 把 `Context` 当作函数的第一个参数：`func fn(ctx context.Context, …)`

* 及时 `defer cancel()`

* 通过 `select` 响应 `<-ctx.Done()`，避免资源泄漏

* 仅在需要时使用 `WithValue`，并使用私有 key 类型
