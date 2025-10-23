---
title: typedef
date: '2025-09-03'
tags:
  - keywords
summary: 'typedef std::function<void()> Function;'
---
### typedef
`typedef`是cpp11新特性，用于为现有数据类型创建别名，但在现代cpp中，大多使用using

    typedef std::function<void()> Function;

    using Function = std::function<void()>; //等同于使用typedef
