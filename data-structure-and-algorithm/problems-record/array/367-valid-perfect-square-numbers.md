## 367. 有效的完全平方数
### cpp：
#### 正确代码：
    
    class Solution {
    public:
        bool isPerfectSquare(int num)
        {
            if (num < 2) //小于2时肯定为完全平方数
            {
                return true;
            }
            
            int left = 1;
            int right = num / 2;
            long long square = 0; //直接使用long long，避免整数除法带来的精度误差
    
            while (left <= right)
            {
                int mid = left + (right - left) / 2; //防止溢出
                square = (long long) mid * mid; //式子里也要带long long才行
                if (square > num)
                {
                    right = mid - 1;
                }
                else if (square < num)
                {
                    left = mid + 1;
                }
                else
                {
                    return true;
                }
            }
    
            return false;
        }
    };

#### 错误代码：

    class Solution {
    public:
        bool isPerfectSquare(int num)
        {
            int square = 0;
            if (num < 2)
            {
                square = num;
            }
            
            int left = 1;
            int right = num / 2;
            while (left <= right)
            {
                int mid = left + (right - left) / 2;
                if (mid > num / mid)
                {
                    right = mid - 1;
                }
                else
                {
                    left = mid + 1;
                    square = mid;
                }
            }
    
            if (square == num / square)
            {
                return true;
            }
            
            return false;
        }
    };
