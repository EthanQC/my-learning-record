## 704.二分查找
### cpp：

        class Solution {
        public:
            int search(vector<int>& nums, int target) 
            {
                int left = 0;
                int right = nums.size() - 1; //通过vector自带的size函数得到数组终点位置
                while(left <= right)
                {
                    // (right - left) / 2 只是偏移量，需要加上起始位置才是数组中正确的下标
                    int middle = left + (right - left) / 2; 
                    if (nums[middle] > target) //说明target在更小的左半边中
                    {
                        right = middle - 1; //将right向左移动，减一是因为right是闭区间，我们不能将已经确认target不存在的位置再次放到新的比较区间中
                    }
                    else if (nums[middle] < target) //说明target在更大的右半边中
                    {
                        left = middle + 1; //将left向右移动，加一也是同理
                    }
                    else
                    {
                        return middle; //在循环中会重复整个过程，直到找到目标数所在的位置
                    }
                }
                return -1; //如果目标数不在数组中则返回-1
            }
        };

### go：

    func search(nums []int, target int) int {
        left := 0
        right := len(nums) - 1

        for left <= right {
            mid := left + (right - left) / 2

            if nums[mid] > target {
                right = mid - 1
            } else if nums[mid] < target {
                left = mid + 1
            } else {
                return mid
            }
        }

        return -1
    }