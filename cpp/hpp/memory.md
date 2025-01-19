### `<memory>` 智能指针
循环引用问题：
假设EventLoop里有一个std::shared_ptr<channel>的map（channel_map_）。Channel又持有EventLoop的shared_ptr或shared_ptr指向与EventLoop相关的资源，这样就有可能形成一个循环引用（A中持有shared_ptr指向B，B中持有shared_ptr指向A，导致引用计数无法归零，对象无法析构，产生内存泄漏）。

如果在channel_map_中存储weak_ptr<channel>，则不会增加Channel对象的引用计数。当channel对应的shared_ptr在其他地方释放后，这个weak_ptr不会阻止channel析构。查询时可以用lock()获取有效shared_ptr，若对象已被析构则返回空，这样避免循环引用问题。

weak_ptr<>是什么？
std::weak_ptr是C++智能指针的一种，它不控制对象生命周期，不增加引用计数，只是“弱引用”。需要对象时通过lock()转为shared_ptr。对象销毁后，weak_ptr会变成空的弱引用，无资源可用。

weak_ptr是C++11引入的智能指针类型之一，它与shared_ptr配合使用。
当你用shared_ptr管理对象时，对象的引用计数会随着shared_ptr的复制而增加，当最后一个shared_ptr销毁时，对象才会释放。但如果两个对象通过shared_ptr互相持有对方（例如A持有B的shared_ptr，B持有A的shared_ptr），则会产生循环引用（Reference Cycle），导致内存无法释放。
weak_ptr的作用是打破这种循环引用。weak_ptr不增加底层对象的引用计数，它只是一个弱引用，只有在需要时通过lock()转化为shared_ptr才暂时使用底层对象。如果对象已被销毁，weak_ptr.lock()会返回空的shared_ptr，确保安全使用。这样就可以避免由于互相使用shared_ptr造成的资源无法释放的问题。