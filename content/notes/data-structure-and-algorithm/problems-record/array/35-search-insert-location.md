## 35. 搜索插入位置
### cpp：

    class Solution {
    public:
        int searchInsert(vector<int>& nums, int target)
        {
            int left = 0; //和上一题代码基本没有什么大变化
            int right = nums.size() - 1;
            
            while (left <= right)
            {
                //为了防止int越界，先计算左右边界的距离，除2，再加在left身上，跟直接相加再除2的效果是一样的
                //也可以直接用long或long long
                int middle = left + (right - left) / 2; 
                
                if (nums[middle] > target)
                {
                    right = middle - 1;
                }
                else if (nums[middle] < target)
                {
                    left = middle + 1;
                }
                else
                {
                    return middle;
                }
            }
            
            return left; //将返回值改为left
        }
    };
