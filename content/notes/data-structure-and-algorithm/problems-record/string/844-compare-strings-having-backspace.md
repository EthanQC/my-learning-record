## 844.比较含退格的字符串

错误代码1：

    class Solution {
    public:
        bool backspaceCompare(string s, string t)
        {
            int slow = 0;
            int str_size = 0;
    
            if (size(s) < size(t))
            {
                str_size = size(t);
            }
            else
            {
                str_size = size(s);
            }
    
            for (int fast = 0; fast < str_size; fast++)
            {
                if (s[fast] == '#')
                {
                    s[fast] = s[fast - 1] = 0; //错误的删除方式，且可能造成访问越界
                }
                else
                {
                    s[slow] = s[fast];
                }
    
                if (t[fast] == '#')
                {
                    t[fast] = t[fast - 1] = 0;
                }
                else
                {
                    t[slow] = t[fast];
                }
                
                slow++;
            }
    
            if (s == t)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    };

错误代码2：

    class Solution {
    public:
        bool backspaceCompare(string s, string t)
        {
            int i = s.size() - 1;
            int j = t.size() - 1;
    
            while (i <= 0 || j <= 0) //条件错误，应该是大于等于0
            {
                int backspaceCount = 0;
    
                while (i <= 0) //条件错误
                {
                    if (s[i] == '#')
                    {
                        backspaceCount++;
                        i--;
                    }
                    else
                    {
                        if (backspaceCount != 0)
                        {
                            backspaceCount--;
                            i--;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
    
                while (j <= 0)
                {
                    if (t[j] == '#')
                    {
                        backspaceCount++;
                        j--;
                    }
                    else
                    {
                        if (backspaceCount != 0)
                        {
                            backspaceCount--;
                            j--;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
    
                if (i >= 0 && j >= 0)
                {
                    if (s[i] != t[j])
                    {
                        return false;
                    }
                    else if (i >= 0 || j >= 0)
                    {
                        return false;
                    }
                }
    
                i--;
                j--;
            }
    
            return true;
        }
    };

正确代码：

    class Solution {
    public:
        bool backspaceCompare(string s, string t)
        {
            int i = s.length() - 1, j = t.length() - 1;
            int skipS = 0, skipT = 0; //创建并维护两个计数器变量
    
            while (i >= 0 || j >= 0) //使用正确的循环条件
            {
                while (i >= 0) //对s字符串的筛选
                {
                    if (s[i] == '#')
                    {
                        skipS++, i--;
                    }
                    else if (skipS > 0)
                    {
                        skipS--, i--;
                    }
                    else
                    {
                        break;
                    }
                }
    
                while (j >= 0) //对t字符串的筛选
                {
                    if (t[j] == '#')
                    {
                        skipT++, j--;
                    }
                    else if (skipT > 0)
                    {
                        skipT--, j--;
                    }
                    else
                    {
                        break;
                    }
                }
    
                if (i >= 0 && j >= 0) //进行比较
                {
                    if (s[i] != t[j]) //只要有一个元素不一样就可以判断两个字符串不同
                    {
                        return false;
                    }
                }
                else
                {
                    if (i >= 0 || j >= 0) //防止有一个数组提前遍历完了，但另一个还没有遍历完
                    {
                        return false;
                    }
                }
    
                i--, j--; //循环最后要将两个指针左移，因为每次外层循环都可以确定两个字符串中的元素是有被比较过的
            }
    
            return true;
        }
    };