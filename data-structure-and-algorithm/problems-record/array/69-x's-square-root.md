## 69. x的平方根
### cpp：

    class Solution {
    public:
        int mySqrt(int x)
        {
            if (x < 2) //此时无论什么数都会直接返回1
            {
                return x;
            }
    
            int left = 1; //防止出现0在分母
            int right = x / 2; //提前缩小范围，提升效率
            int result = 0;
    
            while (left <= right)
            {
                int mid = left + (right - left) / 2; //防止越界
                if (mid > x / mid)
                {
                    right = mid - 1;
                }
                else
                {
                    left = mid + 1;
                    result = mid; //每次二分查找都更新结果的值
                }
            }
    
            return result;
        }
    };
