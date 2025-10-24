---
title: 计算机网络
date: '2025-09-03'
tags:
  - interview-questions
summary: 从上到下分为**应用层、传输层、网络层和链路层**共**四层**
---

# 计算机网络
## 网络基础
#### Q：TCP/IP 网络模型有哪几层？

从上到下分为**应用层、传输层、网络层和链路层**共**四层**

**应用层**直接面向用户或应用程序，定义应用数据格式、会话控制以及具体业务协议，用于实现各种网络应用，常见的协议有 HTTP/HTTPS(Web)、DNS（域名解析）、SMTP（电子邮件）、FTP/SFTP（文件传输）、SSH（远程登录）、Telnet、SNMP（网络管理）等

**传输层**在端到端间提供可靠或不可靠的数据传输服务，包括端口复用、流量控制、差错校验与重传等，常见协议有 TCP（Transmission Control Protocol，面向连接、可靠传输，提供流量控制、拥塞控制、顺序交付）、UDP（User Datagram Protocol，无连接、尽最大努力交付，开销小、实时性好）、QUIC（基于 UDP 的新一代传输协议，集成了加密和多路复用特性）

**网络层**负责主机间分组的选路与转发，即将数据包从源地址送到目标地址，跨越一个或多个网络，并提供逻辑寻址（IP 地址），常见协议有 IP（Internet Protocol，IPv4、IPv6，负责分组的寻址与转发）、ICMP（Internet Control Message Protocol，用于差错报告、网络探测）、IGMP（Internet Group Management Protocol，管理多播组成员关系等）

**链路层**负责在物理介质（网线、光纤、无线等）上封装和发送数据帧，实现相邻网络设备（如交换机、路由器接口、网卡）之间的可靠通信，常见协议有 Ethernet（以太网）、Wi-Fi（802.11）、PPP、ARP（地址解析协议，虽为网络层辅助协议，但通常归到链路层处理 MAC 映射）等

#### Q：TCP/IP 模型和 OSI 模型分别是什么？它们之间有什么区别？

**OSI**（Open Systems Interconnection）**模型**由国际标准化组织制定，将网络通信抽象为**七层**，每层职责清晰，利于教学与协议设计，从上到下依次分为应用层、表示层、会话层、传输层、网络层、数据链路层和物理层

**应用层**为应用程序提供网络服务接口，定义应用协议（如 HTTP、FTP、SMTP）；**表示层**负责数据格式转换、加密／解密、压缩／解压；**会话层**负责会话管理（建立、维护、终止会话）、全双工/半双工控制；**传输层**负责端到端传输管理：可靠性（TCP）、不可靠传输（UDP）、端口复用；**网络层**负责路由与转发，逻辑寻址（IP）、分组交换；**数据链路层**负责帧封装与链路管理，MAC 寻址，差错检测（如 CRC）、流量控制；**物理层**负责物理介质传输比特流：电气、光学、机械接口标准

**TCP/IP 模型**也称作互联网协议族模型，更贴近实际网络协议栈的实现，分为**四层**：**应用层、传输层、网络层和链路层**；**应用层**是	各种网络应用协议，**传输层**是 TCP（可靠）、UDP（无连接）、端口复用，**网络层**是 IP 路由转发、报文分片与重组；ICMP、IGMP 等，**链路层**是以太网/Wi-Fi 帧封装、MAC 寻址、ARP 等

**TCP/IP 模型**是实际的协议栈，更贴近工程实现，结构更简洁，直接对应主流协议实现，更加实践化、工程化，更偏重具体应用协议，更注重协议性能和互操作，全互联网设备普遍使用；**OSI 模型**是强调每层独立职责，层次分明，适合理论教学和协议标准化，不同厂商或协议的实现可在各层内替换而互不影响，主要是理论参考，便于学习、标准化，更偏重数据格式与会话控制，每层职责严谨，可替换性强

#### 什么是网络分层模型？它在网络通信中有什么作用？

#### Q：在浏览器中从输入 URL 到页面展示发生了什么？

输入 URL → 检查本地缓存 → 解析 DNS（可能命中 CDN 边缘）→ 建立连接（TCP+TLS 或 QUIC/TLS）→ 发送 HTTP 请求 → CDN/负载均衡/反向代理/WAF → 应用处理并返回（含缓存/压缩/ETag 等）→ 浏览器并行拉资源（H2/H3 多路复用、优先级）→ 构建 DOM/CSSOM → 生成渲染树、布局、绘制、合成（JS/CSS 的阻塞与优化）→ 页面可见（FCP/LCP）→ 后续异步资源与交互就绪

#### Q：Linux 系统是如何收发网络包的？

**收包**：NIC 把数据 DMA 到环形缓冲 → 触发中断 → NAPI 轮询把包拉进内核 → GRO/校验 → 进入协议栈 → Netfilter（PREROUTING）→ 路由判定（给本机/转发）→ L4（TCP/UDP）→ 送入对应 socket 队列 → 应用 recv() 拿数据

**发包**：应用 send() → 协议栈组包（拥塞控制、分段、校验）→ 路由与邻居解析（ARP/ND）→ Netfilter（OUTPUT/POSTROUTING）→ qdisc 排队/整形 → NIC TX 队列（TSO/校验 offload）→ DMA 下发到线

* 什么是网络协议？它在网络通信中有什么作用？

* 什么是 ARP 协议？它在网络通信中有什么作用？

* IP 地址和 MAC 地址有什么区别？它们在网络通信中各自扮演什么角色？

* 什么是 NAT（网络地址转换）？它在网络通信中有什么作用？

* TCP/IP 模型中，数据链路层和网络层各有哪些主要协议？它们的作用是什么？

* OSI 模型中，哪一层负责数据的加密和解密？哪一层负责数据的传输？

* 什么是网络拥塞？TCP 是如何应对网络拥塞的？

* CDN 是什么？它在网络传输中有什么作用？

## HTTP 与 HTTPS
#### Q：HTTP 是什么？

**HTTP**（HyperText Transfer Protocol） 是一种**应用层、请求-响应式（客户端发请求，服务端回相应）、面向资源**的协议，用于在客户端与服务端之间传输数据

它本身**无连接、无状态（每个请求独立）**（会话靠 Cookie/Token/Session 存在应用层），通过 URL/URI 标识资源，用 方法（GET/POST/PUT/DELETE…）表达意图，用状态码表达结果，配合头部与缓存语义完成内容协商、压缩、鉴权、缓存等

协议在 HTTP/1.1→HTTP/2→HTTP/3(QUIC) 演进中提升性能与可靠性，安全版是 HTTPS（HTTP over TLS）

#### Q：HTTP 常见的状态码有哪些？

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

#### Q：HTTP 常见字段有哪些？

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

#### Q：GET 和 POST 有什么区别？

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

#### Q：GET 和 POST 方法都是安全和幂等的吗？



#### Q：HTTP 缓存有哪些实现方式？



#### Q：什么是强制缓存？



#### Q：什么是协商缓存？



#### Q：HTTP/1.1 的优缺点分别有哪些？



#### Q：HTTP/1.1 的性能如何？



#### Q：HTTP 与 HTTPS 有哪些区别？



#### Q：HTTPS 解决了 HTTP 的哪些问题？



#### Q：HTTPS 是如何建立连接的？其间交互了什么？



#### Q：HTTPS 的应用数据是如何保证完整性的？



#### Q：HTTPS 一定安全可靠吗？



#### Q：HTTP/1.1 相比 HTTP/1.0 提高了什么性能？



#### Q：HTTP/2 做了什么优化？



#### Q：HTTP/3 做了哪些优化？



#### Q：HTTP/1.1 如何优化？如何避免发送 HTTP 请求？如何减少 HTTP 请求次数？如何减少 HTTP 响应的数据大小？



#### Q：HTTPS RSA 的握手过程是什么？



#### Q：HTTPS ECDHE 的握手过程是什么？



#### Q：HTTPS 如何优化？



#### Q：既然有 HTTP 协议，为什么还要有 RPC 和 WebSocket 协议？



#### Q：HTTPS 为什么安全？

A：HTTPS 通过 TLS 实现加密、完整性校验和身份认证，支持前向安全，它在握手阶段以服务器证书公钥完成非对称密钥交换，协商会话密钥，随后的业务报文用对称算法加密并附带 MAC 校验，浏览器会对证书链和域名做验证

#### Q：一个数字证书上面一般都会有什么内容？

A：证书通常含版本、序列号、签名算法、颁发者 Issuer、主体域名/组织、有效期、公钥信息、指纹摘要及扩展、颁发者数字签名等，客户端会验证签名并校验证书链与有效期

#### Q：介绍一下 HTTPS

A：HTTPS 是在 HTTP 的基础上加入了 TLS 或者说 SSL 加密的通信协议，默认走 TCP 443 端口，它的核心在于握手阶段，客户端发 ClientHello，服务器选定加密套件并返回证书，客户端验证证书合法后，用非对称加密协商出对称密钥，最后双方互发 Finished 消息确认；握手完成后，所有数据都通过对称加密和消息认证码进行保护，并用 ECDHD 提供前向安全，保证机密性、完整性和服务器身份认证；相比 HTTP 的明文传输，虽然 HTTPS 增加了握手开销，但一次握手后就能复用会话，还支持 http 2 的多路复用

#### Q：为什么要同时使用公钥和私钥，这两个密钥有什么用

A：公钥和私钥一对是非对称加密的基础，用对方的公钥加密能确保只有拥有对应私钥的那一端才能解密查看，用自己的私钥对数据签名，让对方通过我的公钥来验证，保证消息确实来自我并且没有被篡改，在 HTTPS 中，服务器把公钥打包在 CA 签发的证书里，客户端验证证书无误后，用该公钥校验服务器私钥对握手数据的签名，再用公钥加密，只有服务器私钥能解开，这样既验证了服务器身份，也保证了后续通信的机密性和完整性

## TCP 与 UDP
#### Q：TCP 头格式有哪些？



#### Q：为什么需要 TCP 协议？TCP 工作在哪一层？



#### Q：什么是 TCP？



#### Q：什么是 TCP 连接？



#### Q：如何唯一确定一个 TCP 连接呢？



#### Q：你知道 TCP 和 UDP 吗？它们的区别是什么？分别的应用场景是？



#### Q：TCP 和 UDP 可以使用同一个端口吗？



#### Q：TCP 三次握手过程是什么样的？



#### Q：如何在 Linux 系统中查看 TCP 状态？



#### Q：为什么 TCP 是三次握手而不是两次或者四次？



#### Q：为什么每次建立 TCP 连接时，初始化的序列号都要求不一样呢？



#### Q：初始序列号 ISN 是如何随机产生的？



#### Q：既然 IP 层会分片，为什么 TCP 层还需要 MSS 呢？



#### Q：第一次握手如果丢失了，会发生什么？



#### Q：第二次握手如果丢失了，会发生什么？



#### Q：第三次握手如果丢失了，会发生什么？



#### Q：什么是 SYN 攻击？该如何避开？



#### Q：TCP 四次挥手的过程是什么样的？为什么是四次而不是三次或五次？



#### Q：第一次挥手丢失了，会发生什么？



#### Q：第二次挥手丢失了，会发生什么？



#### Q：第三次挥手丢失了，会发生什么？



#### Q：第四次挥手丢失了，会发生什么？



#### Q：为什么 TIME_WAIT 等待的时间是 2 MSL？



#### Q：为什么需要 TIME_WAIT 状态？



#### Q：TIME_WAIT 过多有什么危害？



#### Q：如何优化 TIME_WAIT？



#### Q：服务器出现大量 TIME_WAIT 状态的原因有哪些？



#### Q：服务器出现大量 CLOSE_WAIT 状态的原因有哪些？



#### Q：如果已经建立了连接，但是客户端突然出现故障了怎么办？



#### Q：如果已经建立了连接，但是服务端的进程崩溃会发生什么？



#### Q：针对 TCP 应该如何 Socket 编程？



#### Q：listen 时候参数 backlog 的意义？



#### Q：accept 发生在三次握手的哪一步？



#### Q：客户端调用 close 了，连接是断开的流程是什么？



#### Q：没有 accept，能建立 TCP 连接吗？



#### Q：没有 listen，能建立 TCP 连接吗？



#### Q：TCP 的重传、滑动窗口、流量控制和拥塞控制分别是什么？详细说说



#### TCP 的流量和拥塞控制分别是怎么实现的？



#### Q：什么是 TCP 队头阻塞问题？



#### Q：什么是 TCP 半连接队列和全连接队列？



#### Q：如何优化 TCP？



#### Q：如何理解 TCP 是面向字节流协议？如何理解字节流？如何解决粘包？



#### Q：为什么 TCP 每次建立连接时，初始化序列号都要不一样呢？



#### Q：SYN 报文什么时候情况下会被丢弃？



#### Q：已建立连接的TCP，收到SYN会发生什么？



#### Q：如何关闭一个 TCP 连接？



#### Q：四次挥手中收到乱序的 FIN 包会如何处理？



#### Q：在 TIME_WAIT 状态的 TCP 连接，收到 SYN 后会发生什么？



#### Q：在 TIME_WAIT 状态的 TCP 连接，收到 RST 会断开连接吗？



#### Q：TCP 连接，一端断电和进程崩溃有什么区别？



#### Q：拔掉网线后， 原本的 TCP 连接还存在吗？



#### Q：tcp_tw_reuse 为什么默认是关闭的？什么是 TIME_WAIT 状态？为什么要设计 TIME_WAIT 状态？tcptwreuse 是什么？为什么 tcptwreuse 默认是关闭的？



#### Q：HTTPS 中 TLS 和 TCP 能同时握手吗？



#### Q：TCP Keepalive 和 HTTP Keep-Alive 是一个东西吗？



#### Q：TCP 协议有什么缺陷？


TCP 连接如何确保可靠性？


#### Q：如何基于 UDP 协议实现可靠传输？



#### Q：QUIC 是如何实现可靠传输的？



#### Q：QUIC 是如何解决 TCP 队头阻塞问题的？



#### Q：QUIC 是如何做流量控制的？



#### Q：QUIC 是如何迁移连接的？



#### Q：TCP 和 UDP 可以使用同一个端口吗？TCP 和 UDP 可以同时绑定相同的端口吗？



#### Q：多个 TCP 服务进程可以绑定同一个端口吗？



#### Q：客户端的端口可以重复使用吗？



#### Q：服务端没有 listen，客户端发起连接建立，会发生什么？



#### Q：不使用 listen ，可以建立 TCP 连接吗？



#### Q：没有 accept，能建立 TCP 连接吗？



#### Q：用了 TCP 协议，数据一定不会丢吗？如果会的话，该怎么解决？



#### Q：TCP 四次挥手，可以变成三次吗？什么情况会出现三次挥手？



#### Q：TCP 序列号和确认号是如何变化的？



* TCP 滑动窗口机制是如何工作的？它在流量控制中有什么作用？

* TCP 拥塞控制中的慢启动、拥塞避免、快重传和快恢复阶段分别是什么？它们的作用是什么？

* 什么是网络拥塞？TCP 是如何应对网络拥塞的？

## IP


## 同步场景
**Q：类似抖音直播间，如果有十万人同时在线，该如何做直播间点赞同步操作？**

A：嗯在这种高并发的场景下，肯定不能使用逐条广播，我会采用异步批量聚合 + 发布或订阅 + websocket 集群广播的方案，首先客户端通过 websocket 将点赞事件写入消息队列，消息队列可以用 Kafka 或 redis stream，然后再使用专门的聚合服务按照某个时间比如 100ms 为单位，把同一房间的点赞事件在内存里累加，然后原子性地存到 redis，更新后再通过 redis pub 或 sub 发布最新总数，然后所有 websocket 节点订阅该房间的更新频道，收到后只发一条点赞更新消息给该房间的所有客户端，客户端拿到最新的点赞数后再更新渲染 UI，这样就保证了高可用和消息可靠，扩展性也比较好，也有一定的容错性

**Q：直播间突然有大流量打过来，现有的服务器资源只能维持现状，该怎么办？**

A：感觉主要还是要先快速降级和限流保护，比如说可以先把一些非核心的功能关闭，可以限制每个用户的请求频率，或者是限制每个房间的并发连接数等，比如说点赞、评论等，或者是把一些非必要的请求丢弃掉，比如说可以把一些低优先级的请求放到消息队列中，等有空余资源时再处理；另外也可以考虑使用 CDN 来缓存一些静态资源，减轻服务器的压力；如果还是不行的话就只能考虑扩容了，比如说可以增加一些新的服务器节点，或者是使用负载均衡来分担流量；如果还是不行的话就只能考虑限流了
如果直播间突然来了超出现有资源的大流量，我会第一时间开启限流与降级，关停非核心功能，优先保证视频推流和互动。接着把所有操作请求写入消息队列，后端按能力排队处理，避免打穿数据库。静态资源和 HLS 流都走 CDN，减轻源站；应用层做本地＋Redis 多级缓存。
同时，我会触发 Kubernetes 的水平弹性伸缩，快速拉新实例，如果资源仍不足，就用 Serverless 函数临时卸载热点请求。事后结合 Prometheus 告警与容量预案，优化压测脚本，确保下次大流量到来时，我们可以平滑度过。

**Q：有没有了解过看门狗机制？**

A：看门狗本质上是一种定时器，用来监控运行状态，系统或服务在正常运行时会不断喂狗，如果在规定时间内没有收到喂狗信号，看门狗就会认定系统卡死或者异常，后端方面主要是操作系统或进程的软件看门狗或者云和容器平台的软件看门狗，如果主逻辑超时没有相应，看门狗线程就会执行自我修复逻辑，比如重启、释放资源、告警等

## 游戏开发
**Q：在开发游戏的时候 TCP 和 UDP 用哪个比较好？**

A：

**Q：那比如当前一帧我要发送大量的数据，用 TCP 会有什么问题？或者说 TCP 相较于 UDP 的不足之处是什么？**

A：
