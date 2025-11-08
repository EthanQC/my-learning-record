## HTTP 与 HTTPS

可以说一下 gRPC 是一个什么样的协议吗？为什么会产生这样一个协议出来？

* 那 gRPC 相对于 RESTful 那种的接口设计有什么优势吗？

* 你刚刚提到了 RESTful 状态的问题，那你在用 gRPC 和其他的组件其他的服务做协调的时候，其中有可能会遇到有什么样的错误？或者你们在用 gRPC 来做组件的联调的时候会跟 RESTful 有什么不同吗，有没有相关的感受？



## HTTP 与 HTTPS
#### HTTP 是什么？

**HTTP**（HyperText Transfer Protocol） 是一种**应用层、请求-响应式（客户端发请求，服务端回相应）、面向资源**的协议，用于在客户端与服务端之间传输数据

它本身**无连接、无状态（每个请求独立）**（会话靠 Cookie/Token/Session 存在应用层），通过 URL/URI 标识资源，用 方法（GET/POST/PUT/DELETE…）表达意图，用状态码表达结果，配合头部与缓存语义完成内容协商、压缩、鉴权、缓存等

协议在 HTTP/1.1→HTTP/2→HTTP/3(QUIC) 演进中提升性能与可靠性，安全版是 HTTPS（HTTP over TLS）

#### HTTP 常见的状态码有哪些？

##### 1xx 信息

* 100 Continue：配合大 Body；服务端允许继续传

* 101 Switching Protocols：WebSocket 升级

* 103 Early Hints：提早下发 Link: rel=preload 加速首屏

##### 2xx 成功

* 200 OK：常规成功

* 201 Created：创建资源（务必带 Location 指向新资源）

* 202 Accepted：异步受理（排队中，结果稍后）

* 204 No Content：成功但无响应体（删除/幂等更新）

* 206 Partial Content：配合 Range 断点续传

##### 3xx 重定向 / 缓存

* 301 vs 308：永久重定向；308 保持方法（POST 仍 POST）

* 302/307/303：临时；307 保持方法，303 强制 GET（表单/支付回跳）

* 304 Not Modified：命中协商缓存（ETag/If-None-Match 或 Last-Modified）

##### 4xx 客户端错误

* 400 Bad Request：参数/格式不对

* 401 Unauthorized：未认证（通常带 WWW-Authenticate），有登录后还不许看是 403

* 403 Forbidden：已认证但无权限/被阻断

* 404 Not Found：资源不存在/隐藏实现细节

* 405 Method Not Allowed：记得回 Allow: GET,POST

* 408 Request Timeout：客户端太慢

* 409 Conflict：版本冲突/资源状态冲突（如并发更新）

* 410 Gone：资源永久移除（SEO 友好）

* 412 Precondition Failed：条件更新失败（配 If-Match 做乐观锁）

* 413/414/415：体积过大/URI 过长/媒体类型不支持

* 422 Unprocessable Entity：语义校验失败（字段合法但不满足业务规则；JSON API/REST 常用）

* 429 Too Many Requests：限流，务必带 Retry-After

##### 5xx 服务端/网关

* 500 Internal Server Error：兜底，别滥用

* 501 Not Implemented：方法未实现

* 502 Bad Gateway：反向代理收到上游异常

* 503 Service Unavailable：过载/维护，可带 Retry-After

* 504 Gateway Timeout：上游超时（区分应用内超时 vs 网关超时）

#### HTTP 常见字段有哪些？

##### 请求相关（Client → Server）

* Host（H1） / :authority（H2/H3）：虚拟主机选择。一定要对齐证书和路由

* User-Agent：客户端标识；现代浏览器更倾向 Client Hints（Sec-CH-…）

* Accept / Accept-Language / Accept-Encoding：内容协商（br,gzip 优先）

* Authorization：Bearer <token>/Basic ...；失败配合服务端返回 WWW-Authenticate

* Referer（拼写历史错别字）和 Origin：跨站安全判定更看 Origin（更严格）

* If-None-Match / If-Modified-Since：协商缓存请求（命中回 304）

* Range / If-Range：断点续传；大文件分块下载

##### 响应相关（Server → Client）

* Content-Type：MIME + charset（例如 application/json; charset=utf-8）

* Content-Length：字节长度；H1 分块则用 Transfer-Encoding: chunked（H2/H3 不用 chunked）

* Content-Encoding：br/gzip 压缩；与 Accept-Encoding 匹配

* Content-Disposition：attachment; filename*=UTF-8''report.pdf（注意 filename* 处理国际化）

* Location：201 Created 指向新资源；3xx 重定向目标

* Retry-After：配 429/503 指导退避

* ETag / Last-Modified：与条件请求成对使用，降低带宽与 TTFB

* Cache-Control / Expires / Age / Vary：缓存策略四件套（见下）

* Accept-Ranges / Content-Range：配 206 返回分段

##### 缓存与协商（高频区）

* Cache-Control（常见指令）：

  * 静态：public, max-age=31536000, immutable

  * 动态：no-store（不落盘）、no-cache（可缓存但回源验证）、must-revalidate、s-maxage（代理缓存）、stale-while-revalidate、stale-if-error

* ETag：强/弱标记（W/"abc"）。弱 ETag 适合模板渲染的小改动

* Vary：区分缓存键，如 Vary: Accept-Encoding, Origin, Authorization（注意：带 Authorization 会显著降低共享缓存命中）

* 304 Not Modified：只有发了条件头才可能拿到；强缓存命中则直接 200(from cache)。

##### CORS（浏览器必问）

* 预检请求：Origin + Access-Control-Request-Method/Headers（OPTIONS）

* 响应：Access-Control-Allow-Origin: https://example.com（或 *）、Access-Control-Allow-Methods/Headers、Access-Control-Allow-Credentials: true（有 Credentials 就不能用 *）、Access-Control-Max-Age

* 若要前端读到自定义头，记得 Access-Control-Expose-Headers。

##### 安全强化（建议默认开启）

* Strict-Transport-Security（HSTS）：强制 HTTPS，示例：max-age=31536000; includeSubDomains; preload

* Content-Security-Policy（CSP）：限制资源来源，防 XSS

* X-Content-Type-Options: nosniff：禁 MIME 嗅探

* X-Frame-Options: DENY / SAMEORIGIN：防点击劫持（或 CSP frame-ancestors 取代）

* Referrer-Policy：strict-origin-when-cross-origin 推荐

* Permissions-Policy：取代老 Feature-Policy，限制传感器/摄像头等权限

* COOP/COEP/CORP：Cross-Origin-Opener/Embedder/Resource-Policy，加强跨站隔离

##### Cookie（会话常识）

* Set-Cookie：Secure; HttpOnly; SameSite=Lax|Strict|None; Path=/; Domain=...; Max-Age=...

* SameSite=None 必须配 Secure（否则被拒收）

* Cookie：请求携带；体积/数量受限（注意头爆）

##### 代理/网关/可观测

* Forwarded（标准）或 X-Forwarded-For/Proto/Host（事实标准）：传递真实客户端 IP/协议

* Via：穿越的代理链

* Traceparent / Tracestate：W3C 分布式追踪；配合 X-Request-ID 或 trace_id 便于排障

##### 连接/升级（少见但会被问）

* Connection: keep-alive/close（H1）；H2/H3 不使用 hop-by-hop 连接头

* Upgrade: websocket + Connection: Upgrade + 一组 Sec-WebSocket-*：握手升级到 WS

* TE/Transfer-Encoding：H1 的分块传输；H2/H3 不允许 Transfer-Encoding: chunked。

##### HTTP/2 / HTTP/3 特性提示

* 伪首部（:method, :scheme, :authority, :path）替代 H1 起始行；首部名小写、压缩（HPACK/QPACK）、多路复用

* Host 在 H2/H3 仍常保留以兼容中间件，但权威以 :authority 为准

#### GET 和 POST 有什么区别？

##### 语义与状态码
GET：读取，常见 200/304/206
POST：提交/创建/动作，常见 201 Created（最好带 Location）、202 Accepted（异步）、200/204

##### 幂等与重试
GET：幂等，代理/客户端可自动重试
POST：非幂等，网络重试可能造成重复下单/重复扣款；可用 Idempotency-Key 或服务端去重表

##### 缓存与协商
GET：强/协商缓存（Cache-Control/ETag/Last-Modified）配合 304 很常见
POST：若要缓存，响应需显式 Cache-Control，很多中间层默认不缓存 POST

##### 安全与隐私
GET 查询串可能进 浏览器历史、服务器访问日志、Referer（HTTPS 仍会进这些位置，除非策略限制）；不要把 Token/密码放 URL
POST 体不会进 URL，但仍可能被服务端日志或抓包记录，敏感信息也要谨慎

##### 传输与兼容
GET 可能受 URL 长度上限影响（实现相关）
POST 体适合大文件（配 multipart/form-data、断点续传用 Range/206 常在 GET 上做下载续传）

##### 表单与重定向
HTML 表单 method="get" 会把字段编码进查询串；method="post" 进请求体
支付/登录回跳常见 303 See Other（把后续交互改成 GET），307/ 308 则保持方法

#### GET 和 POST 方法都是安全和幂等的吗？



#### HTTP 缓存有哪些实现方式？



#### 什么是强制缓存？



#### 什么是协商缓存？



#### HTTP/1.1 的优缺点分别有哪些？



#### HTTP/1.1 的性能如何？



#### HTTP 与 HTTPS 有哪些区别？



#### HTTPS 解决了 HTTP 的哪些问题？



#### HTTPS 是如何建立连接的？其间交互了什么？



#### HTTPS 的应用数据是如何保证完整性的？



#### HTTPS 一定安全可靠吗？



#### HTTP/1.1 相比 HTTP/1.0 提高了什么性能？



#### HTTP/2 做了什么优化？



#### HTTP/3 做了哪些优化？



#### HTTP/1.1 如何优化？如何避免发送 HTTP 请求？如何减少 HTTP 请求次数？如何减少 HTTP 响应的数据大小？



#### HTTPS RSA 的握手过程是什么？



#### HTTPS ECDHE 的握手过程是什么？



#### HTTPS 如何优化？



#### 既然有 HTTP 协议，为什么还要有 RPC 和 WebSocket 协议？



#### HTTPS 为什么安全？

A：HTTPS 通过 TLS 实现加密、完整性校验和身份认证，支持前向安全，它在握手阶段以服务器证书公钥完成非对称密钥交换，协商会话密钥，随后的业务报文用对称算法加密并附带 MAC 校验，浏览器会对证书链和域名做验证

#### 一个数字证书上面一般都会有什么内容？

A：证书通常含版本、序列号、签名算法、颁发者 Issuer、主体域名/组织、有效期、公钥信息、指纹摘要及扩展、颁发者数字签名等，客户端会验证签名并校验证书链与有效期

#### 介绍一下 HTTPS

A：HTTPS 是在 HTTP 的基础上加入了 TLS 或者说 SSL 加密的通信协议，默认走 TCP 443 端口，它的核心在于握手阶段，客户端发 ClientHello，服务器选定加密套件并返回证书，客户端验证证书合法后，用非对称加密协商出对称密钥，最后双方互发 Finished 消息确认；握手完成后，所有数据都通过对称加密和消息认证码进行保护，并用 ECDHD 提供前向安全，保证机密性、完整性和服务器身份认证；相比 HTTP 的明文传输，虽然 HTTPS 增加了握手开销，但一次握手后就能复用会话，还支持 http 2 的多路复用

#### 为什么要同时使用公钥和私钥，这两个密钥有什么用

A：公钥和私钥一对是非对称加密的基础，用对方的公钥加密能确保只有拥有对应私钥的那一端才能解密查看，用自己的私钥对数据签名，让对方通过我的公钥来验证，保证消息确实来自我并且没有被篡改，在 HTTPS 中，服务器把公钥打包在 CA 签发的证书里，客户端验证证书无误后，用该公钥校验服务器私钥对握手数据的签名，再用公钥加密，只有服务器私钥能解开，这样既验证了服务器身份，也保证了后续通信的机密性和完整性