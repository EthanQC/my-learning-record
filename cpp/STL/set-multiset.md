## set/multiset（集合）容器

是一种关联式容器，set不允许容器中有重复的元素，即使调用插入不会报错，但实际并不会被插入，但multiset允许存在重复的元素。

集合容器底层是用二叉树实现的，即使传入的是无序数据，也会自动排序。

提供了一些接口，如`insert()`、`swap()`、`empty()`、`erase()`、`clear()`等，但没有push之类的接口，不过赋值可以像python里的集合数据结构一样，即{}。