## 283.移动零
### cpp：

    class Solution {
    public:
        void moveZeroes(vector<int>& nums)
        {
            int slow = 0;
    
            for (int fast = 0; fast < nums.size(); fast++)
            {
                if (nums[fast] != 0)
                {
                    swap(nums[slow], nums[fast]); //利用库函数交换元素
                    slow++;
                }
            }
        }
    };
