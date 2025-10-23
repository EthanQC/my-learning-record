---
title: common concepts
date: '2025-09-03'
tags:
  - go
summary: >-
  GORM（全称「Go Object Relational Mapping」）是 Go 语言最常用的 ORM 框架之一，它能够让我们使用 Go
  语言的结构体来映射数据库中的表、字段等，从而更方便地进行数据库的增删改查操作
---
## GORM 是什么？

GORM（全称「Go Object Relational Mapping」）是 Go 语言最常用的 ORM 框架之一，它能够让我们使用 Go 语言的结构体来映射数据库中的表、字段等，从而更方便地进行数据库的增删改查操作

通过在结构体字段上标注 `gorm:"..."` 这些标签（tag），我们可以告诉 GORM：

* 哪些字段是主键（primary key）

* 哪些字段不可为空（not null）

* 某些字段的大小限制（size:50 表示字符串长度最多 50）

* 字段名与数据库实际字段名称的对应方式

* 以及其他更多的自定义配置

简单来说，GORM 帮助你简化了对数据库的操作，让你可以更像在操作对象而不是直接写 SQL 语句。GORM 会根据你的结构体和标签自动生成或执行对应的 SQL 命令

## 什么是序列化和反序列化？
序列化（Serialization）：将某种数据结构或对象（比如 Go 的结构体）转换成一种「可存储或传输」的格式（通常是字符串或二进制），好比把一个结构体变成 JSON 字符串，以便发送到网络或者保存到文件里

反序列化（Deserialization）：则是把「序列化后的数据」（例如 JSON 字符串）重新还原为程序里可以使用的对象或数据结构

在 Go 语言中，我们常见的就是使用 encoding/json 或其他类似库来将结构体和 JSON 字符串做相互转换

* 当你做 json.Marshal()，就是在做序列化。它会把你的结构体变成 JSON 格式的字符串

* 当你做 json.Unmarshal()，就是在做反序列化。它会把你收到的 JSON 字符串解析回 Go 结构体
