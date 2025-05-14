## 209. 长度最小的子数组
### cpp：

    class Solution
    {
    public:
        int minSubArrayLen(int target, vector<int>& nums)
        {
            int slow = 0;
            int sum = 0;
            int results = INT_MAX; //宏
            int length = 0;

            for (int fast = 0; fast < nums.size(); fast++)
            {
                sum += nums[fast];

                while (sum >= target)
                {
                    length = fast - slow + 1;
                    results = results < length ? results : length; //比较，实时更新长度
                    sum -= nums[slow];
                    slow++;
                }
            }

            return results == INT_MAX ? 0 : results;
        }
    };

### go：

    func minSubArrayLen(target int, nums []int) int {
        slow, length, sum := 0, 0, 0
        results := len(nums) + 1 // +1 是为了实现不存在子数组时返回 0

        for fast := 0; fast < len(nums); fast++ {
            sum += nums[fast]

            for sum >= target {
                length = fast - slow + 1

                if length <= results {
                    results = length
                } 

                sum -= nums[slow]
                slow++
            }
        }

        if results == len(nums) + 1 {
            return 0
        } else {
            return results
        }
    }