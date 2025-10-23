    // 普通写法：
    int x = someFunction();
    if (x > 0)
    {
        // ...
    }

    // “内联”写法：cpp17之后允许
    if (int x = someFunction(); x > 0)
    {
        // ...
    }

    // 或更旧的风格（C++17 之前）：
    if (int x = someFunction())
    {
        if (x > 0)
        {
            // ...
        }
    }

新写法的好处：

变量的作用域（scope）仅限于该 if 以及其后紧随的 else 块之内，离开后就失效

这样做往往能让代码更紧凑，也避免污染外部作用域