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
