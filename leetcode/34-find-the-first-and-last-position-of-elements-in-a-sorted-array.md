## 34. 在排序数组中查找元素的第一个和最后一个位置

正确代码：

    class Solution {
    public:
        vector<int> searchRange(vector<int>& nums, int target)
        {
            int Left = findLeftBoundary(nums, target);
            int Right = findRightBoundary(nums, target);
            
            if (Left == -1 || Right == -1)
            {
                return {-1, -1};
            }
    
            return {Left, Right};
        }
    
    private:
        int findLeftBoundary(vector<int>& nums, int target)
        {
            int left = 0;
            int right = nums.size() - 1;
            int leftBoundary = -1; //给边界赋初始值便于标识
    
            while (left <= right)
            {
                int middle = left + (right - left) / 2; //防止越界
                if (nums[middle] < target)
                {
                    left  = middle + 1;
                }
                else //即left >= target
                {
                    if (nums[middle] == target)
                    {
                        leftBoundary = middle;
                    }
                    right = middle - 1;
                }
            }
    
            return leftBoundary;
        }
    
        int findRightBoundary(vector<int>& nums, int target)
        {
            int left = 0;
            int right = nums.size() - 1;
            int rightBoundary = -1;
    
            while (left <= right)
            {
                int middle = left + (right - left) / 2;
                if (nums[middle] > target)
                {
                    right = middle - 1;
                }
                else
                {
                    if (nums[middle] == target)
                    {
                        rightBoundary = middle;
                    }
                    left = middle + 1;
                }
            }
    
            return rightBoundary;
        }
    };

错误代码：

    class Solution {
    public:
        vector<int> searchRange(vector<int>& nums, int target)
        {
            int left_find_leftBoundary = 0;
            int left_find_rightBoundary = 0;
            int right_find_leftBoundary = nums.size() - 1;
            int right_find_rightBoundary = nums.size() - 1;
            int leftBoundary = 0;
            int rightBoundary = 0;
    
            while (left_find_leftBoundary <= right_find_leftBoundary && left_find_rightBoundary <= right_find_rightBoundary)
            {
                while (left_find_leftBoundary <= right_find_leftBoundary)
                {
                    int middle_find_leftBoundary = left_find_leftBoundary + (right_find_leftBoundary - left_find_leftBoundary) / 2;
                    if (nums[middle_find_leftBoundary] > target)
                    {
                        right_find_leftBoundary = middle_find_leftBoundary - 1;
                    }
                    else if (nums[middle_find_leftBoundary] < target)
                    {
                        left_find_leftBoundary = middle_find_leftBoundary + 1;
                    }
                    else if (nums[middle_find_leftBoundary == target])
                    {
                        leftBoundary = middle_find_leftBoundary;
                        break;
                    }
                    else
                    {
                        leftBoundary = left_find_leftBoundary;
                        break;
                    }
                }
    
                while (left_find_rightBoundary <= right_find_rightBoundary)
                {
                    int middle_find_rightBoundary = left_find_rightBoundary + (right_find_rightBoundary - left_find_rightBoundary) / 2;
                    if (nums[middle_find_rightBoundary] > target)
                    {
                        right_find_rightBoundary = middle_find_rightBoundary - 1;
                    }
                    else if (nums[middle_find_rightBoundary] < target)
                    {
                        left_find_rightBoundary = middle_find_rightBoundary + 1;
                    }
                    else if (nums[middle_find_rightBoundary == target])
                    {
                        rightBoundary = middle_find_rightBoundary;
                        break;
                    }
                    else
                    {
                        rightBoundary = left_find_rightBoundary;
                        break;
                    }
                }
    
                return {leftBoundary, rightBoundary};
            }
    
            return {-1, -1};
        }
    };
