---
title: single instance
date: '2025-09-03'
tags:
  - design-mod
summary: using namespace std;
---
## 单例模式是什么
[推荐阅读](https://github.com/youngyangyang04/kama-DesignPattern/blob/main/DesignPattern/1-%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F.md)

## 示例题目的代码
cpp:

    # include <iostream>
    # include <map>

    using namespace std;

    class shopping_cart_manager
    {
    private:
        map<string, int> cart;

        shopping_cart_manager() {};

    public:
        static shopping_cart_manager& get_instance()
        {
            static shopping_cart_manager instance;
            return instance;
        }

        void add_to_cart(const string& item_name, int item_num)
        {
            cart[item_name] += item_num;
        }

        void display_cart() const
        {
            for (const auto& item : cart)
            {
                cout << item.first << " " << item.second << endl;
            }
        }
    };

    int main()
    {
        string item_name;
        int item_num;

        shopping_cart_manager& cart = shopping_cart_manager::get_instance();
        
        while (cin >> item_name >> item_num)
        {
            cart.add_to_cart(item_name, item_num);
        }

        cart.display_cart();

        return 0;
    }
