## 977.有序数组的平方

错误代码1：

    class Solution {
    public:
        vector<int> sortedSquares(vector<int>& nums)
        {
            int i = 0;
    
            while (i < nums.size())
            {
                nums[i] = nums[i] * nums[i]; //溢出越界了
            }
    
            int right = 0, left = 1;
    
            while (right < left < nums.size())
            {
                if (nums[right] > nums[left])
                {
                    nums[left] = nums[right];
                }
    
                right++, left++;
            }
    
            return nums;
        }
    };

错误代码2：

        class Solution {
        public:
            vector<int> sortedSquares(vector<int>& nums)
            {
                int i = 0;
                int j = nums.size() - 1;
        
                while (i <= j)
                {
                    if (nums[i] * nums[i] > nums[j] * nums[j])
                    {
                        nums[i] = nums[j] * nums [j]; //导致数据覆盖问题，且没有排序
                    }
                    i++, j--;
                }
        
                return nums;
            }
        };

错误代码3：

        class Solution {
        public:
            vector<int> sortedSquares(vector<int>& nums)
            {
                int left = 0, index = 0; //要从后往前排
                int right = nums.size() - 1;
                vector<int> result(nums.size());
        
                while (left <= right)
                {
                    if (nums[left] * nums[left] > nums[right] * nums[right])
                    {
                        result[index] = nums[right] * nums [right];
                        right--;
                    }
                    else
                    {
                        result[index] = nums[left] * nums[left];
                        left++;
                    }
        
                    index++;
                }
        
                return result;
            }
        };

正确代码：

    class Solution {
    public:
        vector<int> sortedSquares(vector<int>& nums)
        {
            int left = 0;
            int right = nums.size() - 1;
            int index = nums.size() - 1; //从后往前排
            vector<int> result(nums.size());
    
            while (left <= right)
            {
                if (nums[left] * nums[left] > nums[right] * nums[right])
                {
                    result[index] = nums[left] * nums [left];
                    left++;
                }
                else
                {
                    result[index] = nums[right] * nums[right];
                    right--;
                }
    
                index--; //别忘了移动index，每次循环肯定都会给新数组赋过值的
            }
    
            return result;
        }
    };
