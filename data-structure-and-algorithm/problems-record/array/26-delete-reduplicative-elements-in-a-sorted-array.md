## 26.删除有序数组中的重复项
### cpp：
#### 错误代码：

    class Solution {
    public:
        int removeDuplicates(vector<int>& nums)
        {
            int slow = 0; //没有修改初始值，导致数组索引越界
    
            for (int fast = 0; fast < nums.size(); fast++) //没有修改初始值，导致数组索引越界
            {
                if (nums[fast] != nums[fast + 1])
                {
                    nums[slow] = nums[fast];
                    slow++;
                }
            }
    
            return slow;
        }
    };

#### 正确代码：

    class Solution {
    public:
        int removeDuplicates(vector<int>& nums)
        {
            int slow = 1;
    
            if (nums.size() == 0) //增加算法完整性
            {
                return 0;
            }
    
            for (int fast = 1; fast < nums.size(); fast++)
            {
                if (nums[fast] != nums[fast - 1]) //判断是否跟前一个元素相同
                {
                    nums[slow] = nums[fast];
                    slow++;
                }
            }
    
            return slow;
        }
    };