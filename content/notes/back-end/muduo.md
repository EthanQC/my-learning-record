---
title: muduo
date: '2025-09-03'
tags:
  - back-end
summary: >-
  one loop per thread的含义： one loop per
  thread是muduo的一个设计理念，即每个EventLoop只在它所属的单独线程中运行。这意味着同一个EventLoop的所有操作都在同一个线程中完成，从而简化了并发问题，不需要锁来保护EventLoop本身的数据结构。
  主线程（main reactor）只处理新连接事件，然后分发
---
### muduo
muduo是一个网络库

one loop per thread的含义：
one loop per thread是muduo的一个设计理念，即每个EventLoop只在它所属的单独线程中运行。这意味着同一个EventLoop的所有操作都在同一个线程中完成，从而简化了并发问题，不需要锁来保护EventLoop本身的数据结构。
主线程（main reactor）只处理新连接事件，然后分发给子线程（sub reactor），每个sub reactor对应一个EventLoop运行在自己的线程中，专门处理其管理下的连接的IO事件。

Muduo使用反应堆（Reactor）模型，核心是EventLoop，内部使用Epoll或Poller作为IO复用工具。Channel表示一个文件描述符的事件和回调，TimerQueue负责定时任务。Acceptor监听新连接事件并通过回调建立TcpConnection。TcpConnection负责读写数据，Buffer管理数据缓冲区。整个模型是事件驱动、回调机制。当有事件产生时，EventLoop通知对应Channel执行回调，回调中处理逻辑（比如读数据、写数据、关闭连接等）。

一个EventLoop对应一个线程：
EventLoop内部调用epoll_wait()阻塞当前线程，等待事件发生。这是该EventLoop的主要循环逻辑。

异步注册新fd、异步任务：
如果在其他线程中想要让这个EventLoop注册一个新的fd（即对epoll进行epoll_add等操作），直接跨线程修改数据结构会有同步问题。为了解决这个问题，Muduo的设计是这样的：

你在另一个线程中想让EventLoop执行某个操作（例如添加一个新的fd监听），你不会直接操作EventLoop内部数据，而是通过一个线程安全的队列/回调列表把这个操作（一个函数）push进去。
推完之后，为了让处于epoll_wait()阻塞中的EventLoop线程醒过来执行这个新操作，你向EventLoop持有的eventfd写入一个字节，eventfd的可读事件会被epoll_wait()检测到。
触发唤醒：
epoll_wait()因为eventfd变得可读而返回（不再阻塞），EventLoop线程从就绪事件列表中发现eventfd可读，执行handleRead()将eventfd中的数据读出，发现有新任务在pending_functions_队列中，就执行它（比如epollerAdd()给新fd注册事件）。执行完后，如果暂时没有其他事情可做，EventLoop线程会再次调用epoll_wait()进入阻塞等待下一个事件。
这整个过程就是一种异步唤醒机制：通过往eventfd写入数据来异步地唤醒原本阻塞在epoll_wait()中的线程。处理完事件后，如果没有其他任务，EventLoop又进入epoll_wait()阻塞，这个循环不断重复。

这是不是边缘触发和异步唤醒的体现？
异步唤醒是指通过eventfd写入数据来唤醒EventLoop，这是一个独立的机制，不一定非要ET模式才可以实现。ET（边缘触发）只是epoll的工作模式，与异步唤醒是两个概念，但二者经常配合使用：

异步唤醒保证了可以跨线程通知EventLoop，让它脱离阻塞去处理新任务。
ET模式则是优化性能的一种措施，减少重复通知事件，要求你在事件发生时一次性彻底处理完可用数据。
所以你的描述是基本对的：

是的，往eventfd写入数据后，epoll_wait()阻塞的EventLoop被唤醒，处理事件之后又回到阻塞状态，再次等待事件发生。这是一种异步事件处理和唤醒机制。

Proactor与Reactor模型的区别：
Reactor模式下，框架只是监听事件（可读可写等），当事件准备就绪后通知用户代码执行实际的I/O操作（用户负责read/write）。
Proactor模式下，I/O操作由操作系统异步完成，当操作系统完成I/O后通知用户代码处理结果（用户只处理完成事件，不需要自己主动调用read/write）。

Reactor：
优点：模型简单清晰，用户对I/O时机有较高控制度；易于在多平台实现（epoll、kqueue、select都能用）。
缺点：需要用户主动进行I/O操作，当并发连接很多且I/O操作复杂时，逻辑稍显繁琐。
Proactor：
优点：异步I/O由操作系统或底层库完成，用户代码更加专注业务逻辑；在正确支持的系统上性能极高。
缺点：依赖底层操作系统对真正的异步I/O支持（如Windows的IOCP），在Linux上实现真正的Proactor较为困难（之前Linux的AIO支持较差，现代Linux有io_uring，但仍是新技术）。

文件描述符（FD）：
在类Unix系统中，文件描述符是一个整数，用于标识已打开的文件、socket、管道或设备。内核使用文件描述符来管理和访问底层资源。可以将其理解为操作系统层面的"文件句柄"。

线程监控的管道（pipe）：
管道是Unix提供的一种单向数据通道，用于进程（或线程）间通信的简单方式。一个管道有两个端：一个用于写数据，一个用于读数据。使用管道可以让工作线程或监控线程互相通信，比如通过往管道写入数据，让另一个线程从管道读到事件触发处理逻辑。

socket：
socket是网络编程中用于建立连接、收发数据的"文件描述符"类型的接口。尽管socket常用于网络（TCP/UDP）编程，但在Unix系统中，socket本身也是一种文件描述符。甚至有Unix域套接字（UNIX domain socket）用于本地进程通信。所以socket在概念上是抽象的I/O端点，不仅限于网络远程通信，也可用于本地通信。

错误码EAGAIN是什么？read()函数是什么？

EAGAIN错误码：
当对一个非阻塞文件描述符执行读或写操作时，如果当前没有数据可读（或无法立即写入），内核不会阻塞调用线程，而是立即返回错误码EAGAIN或EWOULDBLOCK，表示"资源暂时不可用，请稍后再试"。
这在非阻塞I/O编程中很常见，程序需要根据此返回码来判断是否要再次尝试读取或写入数据。

read()函数：
read()是Unix系统调用，用于从文件描述符中读取数据到用户提供的缓冲区中。对于socket来说，read()会尝试从socket的接收缓冲中读数据。如果数据不可用且socket是非阻塞模式，则返回-1并设置errno为EAGAIN。
