## 27.移除元素

    class Solution {
    public:
        int removeElement(vector<int>& nums, int val)
        {
            int slow = 0; //创建慢指针
    
            for (int fast = 0; fast < nums.size(); fast++)
            {
                if (nums[fast] != val) //快指针先遍历
                {
                    nums[slow] = nums[fast]; //如果没找到要删除的，就赋值并右移慢指针
                    slow++;
                }
            }
    
            return slow;
        }
    };