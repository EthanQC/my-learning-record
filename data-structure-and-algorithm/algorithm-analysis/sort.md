## 稳定性
#### 什么是排序算法的“稳定性”

在一个待排序序列里，元素往往不仅有用来比较大小的“关键字”，还附带其他属性，例如一组学生记录按成绩排序，成绩相同的同学原本在名单中的先后顺序就体现了他们在班级花名册中的位置

如果排序之后这些“同分同学”的**相对次序保持不变**，我们就说算法是**稳定**的；如果次序可能被打乱，就是不稳定的

稳定性之所以重要，主要出现在两类场景：

**多关键字排序**——先按次要关键字排，再按主要关键字排，如果第二次排序使用稳定算法，主关键字相等时能保持第一次排序的结果，从而达到“多层排序”的目的

**需要保留原始顺序的业务**——日志、交易流水等记录里，同键值的先后顺序往往具有语义，使用稳定排序能避免额外的序号字段

#### 常见算法的稳定性速览

| 稳定 | 不稳定 |
| --- | --- |
| 冒泡、插入、归并、计数、基数(Timsort 也稳定) | 选择、快速、堆、Shell |

归并排序借助临时数组“不跨越”相等元素而稳定，快速排序 / 堆排序因为交换方式会把相等元素跨越搬动而不稳定

#### Go 语言示例：写一个稳定的插入排序

Go 1.18 起支持泛型，这里实现一个对任何 `~cmp.Ordered` 类型都适用的插入排序（稳定）

```go
package main

import (
	"fmt"
	"cmp"
)

// InsertSortStable 对切片就地进行稳定插入排序
func InsertSortStable[T cmp.Ordered](a []T) {
	for i := 1; i < len(a); i++ {
		key := a[i]
		j := i - 1
		for ; j >= 0 && a[j] > key; j-- { // > 而非 >= 保证相等元素不后移 → 稳定
			a[j+1] = a[j]
		}
		a[j+1] = key
	}
}

func main() {
	data := []int{3, 1, 2, 1, 2}
	InsertSortStable(data)
	fmt.Println(data) // [1 1 2 2 3]，原本前面的 1/2 仍排在后来的 1/2 前面
}
```

要点：内层循环用“挪动空位”而非直接交换，从而不会把关键字相等的元素越过彼此

#### C++ 示例：典型的不稳定快速排序

下面是一份手写快排（Hoare 分区），展示它为何天然不稳定

```cpp
#include <iostream>
#include <vector>
#include <utility>

int partition(std::vector<int>& a, int low, int high) {
    int pivot = a[low];
    int i = low - 1, j = high + 1;
    while (true) {
        do { --j; } while (a[j] > pivot);
        do { ++i; } while (a[i] < pivot);
        if (i >= j) return j;
        std::swap(a[i], a[j]); // 交换可能跨过相等元素 → 不稳定
    }
}

void quickSort(std::vector<int>& a, int low, int high) {
    if (low < high) {
        int p = partition(a, low, high);
        quickSort(a, low, p);
        quickSort(a, p + 1, high);
    }
}

int main() {
    std::vector<int> v{3, 1, 2, 1, 2};
    quickSort(v, 0, v.size() - 1);
    for (int x : v) std::cout << x << ' ';
}
```

##### 为什么快排不稳定？

分区时通常通过“交换”把小于基准的元素放左边、大于基准的放右边

若有两个关键字相等的元素 A、B 分别在基准两侧，分区时它们可能被交换；或者在同侧时，递归子分区又会继续交换，最终打乱原相对顺序，这种交换模式只关心“左右”，不关心“先后”，因此不稳定

若要做成稳定快排，必须引入辅助数组或链表将分区改写成“按顺序拷贝”，代价是失去原地排序优势

## 冒泡排序
#### 冒泡排序是什么？
冒泡排序（Bubble Sort）是一种**比较‑交换类的排序算法**

它把待排序列看成一个**气泡池**：每一次遍历都会把“最大（或最小）”的元素像气泡一样“冒”到序列的一端

重复这一过程，直到整个序列有序。虽然算法思想直观、代码极其简洁，但它的平均与最坏时间复杂度都是 `O(n²)`，空间复杂度 `O(1)`，因此只适合教学演示或数据量较小且对稳定性有要求的场景

#### 逐步拆解冒泡排序的四个核心步骤

| 步骤 | 目的 | 细节说明 |
| --- | --- | --- |
| 外层循环：确定轮次| 决定还需要几轮比较 | 第 `i` 轮结束后，序列末尾已经有 `i` 个“气泡”固定到位；因此只需进行 `n‑1` 轮即可完成排序 |
内层循环：两两比较 | 找出本轮“最大（小）元素” | 指针 j 从序列开头向末尾扫描，每次检查 `arr[j]` 与 `arr[j+1]` |
条件判断：是否交换 | 保持部分序列有序 | 如果当前方向要求 `arr[j] > arr[j+1]`（升序），就交换两者，让更大的“冒”向右 |
提前终止：有序检测 | 剪枝优化，提升最佳情况性能 | 引入布尔标志 `swapped`，若某一轮中一次交换都没发生，说明序列已全局有序，可立即结束

* 稳定性：冒泡排序只在“ > ”时交换，不会跨过相等元素，因此是稳定排序
* 最佳复杂度：当输入本身已排序时，只需一次扫描即可判定，时间复杂度降到 O(n)
* 升级版：三种常见优化手段
* 早停标志：上文提到的 swapped
* 边界缩减：每完成一轮，最后一次交换的位置往后都必定已排序，下轮比较只需到该位置即可
* 双向冒泡（Cocktail Shaker）：每轮先从左到右“冒大泡”，再从右到左“沉小泡”，适合“局部乱序”数据

#### 使用 Go 实现冒泡排序
下面给出两段代码示例：

`BasicBubbleSort`：最纯粹的实现，便于理解流程

`OptimizedBubbleSort`：加入提前终止和边界缩减两种剪枝，展示工业写法

```go
package main

import "fmt"

// BasicBubbleSort 纯基础版：无任何优化
func BasicBubbleSort(nums []int) {
	n := len(nums)
	for i := 0; i < n-1; i++ {             // 共 n-1 轮
		for j := 0; j < n-i-1; j++ {       // 每轮比较到 n-i-1
			if nums[j] > nums[j+1] {       // 升序：把“大”的往右冒
				nums[j], nums[j+1] = nums[j+1], nums[j]
			}
		}
	}
}

// OptimizedBubbleSort 提前终止 + 边界缩减
func OptimizedBubbleSort(nums []int) {
	n := len(nums)
	for swapped := true; swapped; {        // swapped 为 true 才继续下一轮
		lastSwap := 0                      // 记录本轮最后一次交换位置
		swapped = false
		for j := 0; j < n-1; j++ {
			if nums[j] > nums[j+1] {
				nums[j], nums[j+1] = nums[j+1], nums[j]
				swapped = true
				lastSwap = j + 1           // 更新边界
			}
		}
		n = lastSwap                       // 缩小下一轮比较范围
	}
}

func main() {
	a := []int{5, 1, 4, 2, 8, 0, 2}
	fmt.Println("原始：", a)

	basic := make([]int, len(a))
	copy(basic, a)
	BasicBubbleSort(basic)
	fmt.Println("基础冒泡：", basic)

	opt := make([]int, len(a))
	copy(opt, a)
	OptimizedBubbleSort(opt)
	fmt.Println("优化冒泡：", opt)
}
```

##### 关键点说明
* 切片复制：用 `copy` 创建副本，避免对原切片就地排序影响后续比较
* 就地交换：利用 Go 的多重赋值 `a, b = b, a` 语法，避免临时变量
* 提前终止条件：若一整轮没交换，将 `swapped` 置为 `false`，直接跳出外层循环
* 边界变量 `n`：动态缩短待比较尾部，提高在“几乎有序”数据上的效率。

#### 小结
冒泡排序凭借“交换相邻元素、最大（最小）元素逐轮浮出水面”的气泡意象成为讲授排序算法的入门首选，它的实现简单、稳定性好，但在大数据集上性能低下

## 插入排序
#### 插入排序的基本思想
想象你在打扑克牌：手里已有一叠排好序的牌，每摸到一张新牌，就从右向左找到它该插入的位置，然后把右侧所有比它大的牌依次右移一格，空出的位置塞进去——一圈下来，手里的牌仍然整体有序

插入排序完全沿用这个思路：

* 把下标 0 视为已排好序的子数组
* 从下标 1 开始逐个读取“待插入元素”，向左扫描已排区
* 扫描过程中，凡是比待插入元素大的，都整体右移一格
* 扫描终止点就是插入位置，把元素放进去
* 重复直到末尾，整个数组就排好序

#### 逐轮演示（升序为例）
以序列 `[4, 3, 5, 1]` 为例：

| 轮次 | 待插入元素 | 扫描 & 位移 | 结果子序列 |
| --- | --- | --- | --- |
| i=1 | 3 | 4→右移 | [3, 4, 5, 1] |
| i=2 | 5 | 5≥4，停止 | [3, 4, 5, 1] |
| i=3 | 1 | 5→右移,4→右移,3→右移 | [1, 3, 4, 5] |

可见，每一轮都让左侧区间保持有序，新元素只是“插缝”进去

#### 复杂度与特性
* 时间复杂度：最坏 & 平均 `O(n²)`；当原数据几乎有序时，只需比较不需移动，最佳 `O(n)`
* 空间复杂度：`O(1)`，原地排序
* 稳定性：只在 `>` 时右移，不会跨越相等元素，因而稳定
* 适用场景：
  * 小规模数据（几十个以内）
  * 几乎有序的数据
  * 作其它排序（如 快排、归并）的小区段优化，或作为 `TimSort` 的关键子步骤
* 改进：可用二分插入排序把比较次数降到 `O(n log n)`，但元素移动仍是 `O(n²)`

#### Go 语言实现
Go 1.18+ 支持泛型，下面给出一个适用于任意可比较类型的插入排序

关键点：内层循环用“挪动”而非“多次交换”，保持稳定

```go
package main

import (
	"fmt"
	"cmp"
)

// InsertSortStable 就地、稳定插入排序
func InsertSortStable[T cmp.Ordered](a []T) {
	for i := 1; i < len(a); i++ {
		key := a[i]
		j := i - 1
		for ; j >= 0 && a[j] > key; j-- { // 只在大于时右移
			a[j+1] = a[j]                // “搬”元素空出插槽
		}
		a[j+1] = key
	}
}

func main() {
	data := []int{4, 3, 5, 1}
	InsertSortStable(data)
	fmt.Println(data) // 输出: [1 3 4 5]
}
```

内层循环条件 `a[j] > key`（而非 >=），确保相等元素不越位 → 稳定

右移通过覆盖而非调用 `swap`，避免无意义的多次交换

#### C++17 实现
下面先给“能跑”的简单版本，再给更灵活的泛型迭代器版本

##### 朴素版
```cpp
#include <iostream>
#include <vector>

void InsertSort(std::vector<int>& v) {
    for (size_t i = 1; i < v.size(); ++i) {
        int key = v[i];
        int j = static_cast<int>(i) - 1;
        while (j >= 0 && v[j] > key) {
            v[j + 1] = v[j]; // 右移
            --j;
        }
        v[j + 1] = key;
    }
}

int main() {
    std::vector<int> a{4, 3, 5, 1};
    InsertSort(a);
    for (int x : a) std::cout << x << ' ';
}
```

##### 双随机迭代器模板版
```cpp
#include <iterator>
#include <functional>

template <typename RandomIt,
          typename Compare = std::less<typename std::iterator_traits<RandomIt>::value_type>>
void InsertSort(RandomIt first, RandomIt last, Compare comp = Compare{}) {
    for (auto it = std::next(first); it != last; ++it) {
        auto key = std::move(*it);
        auto j   = it;
        while (j != first && comp(key, *std::prev(j))) {
            *j = std::move(*std::prev(j));
            --j;
        }
        *j = std::move(key);
    }
}
```

可处理任何支持随机迭代器的容器，且可以自定义比较器实现降序或多关键字排序

## 如何对一个数组进行排序
下面我们从算法分类、时间／空间／稳定性、以及在 Go 里常见的内置与手写实现三个维度，来系统地回顾一下对一个数组排序可以用哪些方法

#### 排序算法大类
##### 比较排序（Comparison Sort）
通过两两元素比较、交换或移动来达到有序

* 下界：平均／最坏都无法突破 O(n log n)
* 代表：冒泡、选择、插入、希尔、归并、快速、堆排序等

##### 非比较排序（Non-Comparison Sort）
利用元素的数值特性（计数、基数、桶）直接“分布”到正确位置，可以做到线性时间 `O(n + k)`

代表：计数排序、桶排序、基数排序

#### 主要算法比较
| 算法 | 时间复杂度 | 空间复杂度 | 稳定性 | 适用场景 |
| --- | --- | --- | --- | --- |
| 冒泡排序 | `O(n²)` | `O(1)` | 稳定 | 小规模、教学演示 |
| 选择排序 | `O(n²)` | `O(1)` | 不稳定 | 内存极度受限时 |
| 插入排序 | `O(n²)`（最好 `O(n)`） | `O(1)` | 稳定 | 部分有序、小规模数据 |
| 希尔排序 | `O(n¹·³–n¹·⁵)` | `O(1)` | 不稳定 | 中等规模，比插入排序更快 |
| 归并排序 | `O(n log n)` | `O(n)` | 稳定 | 稳定排序、大数据外部排序 |
| 快速排序 | 平均 `O(n log n)`，最坏 `O(n²)` | `O(log n)` | 不稳定 | 一般用途、内存敏感时（Go、C++ STL） |
| 堆排序 | `O(n log n)` | `O(1)` | 不稳定 | 内存受限、要 `O(n log n)` 保证 |
| 计数排序 | `O(n + k)` | `O(n + k)` | 稳定 | 值域不大且整数 |
| 桶排序 | 平均 `O(n + k)` | `O(n + k)` | 稳定 | 浮点数、分布均匀 |
| 基数排序 | `O(d·(n + k))` | `O(n + k)` | 稳定 | 固定位数整数或字符串 |

k 是值域大小（计数／桶），d 是最大位数（基数排序）

一般实战中常用快速排序（C++、Go sort 都是变种 `IntelliSort/IntroSort`）、归并排序（需要稳定）、堆排序（空间受限）；非比较排序常在特定场景（计数、基数、桶）使用

#### Go 语言中的排序
##### 内置接口式排序
Go 标准库提供了 `sort` 包，最常用的是：

```go
import "sort"

// 对 int 切片排序
sort.Ints(a []int)

// 对任意切片按照自定义比较排序
sort.Slice(data, func(i, j int) bool {
    return data[i].Key < data[j].Key
})
```
`sort.Ints` 底层用的是 `Heapsort + InsertionSort` 的混合实现，平均 `O(n log n)`，额外空间 `O(1)`

##### 手写常见算法示例
下面给出两个经典算法的 Go 实现骨架：快速排序 和 归并排序

快速排序（双路划分）
```go
func quickSort(a []int, lo, hi int) {
    if lo >= hi {
        return
    }
    // 1. 随机选一个基准，放到 lo 位置
    pivotIdx := lo + rand.Intn(hi-lo+1)
    a[lo], a[pivotIdx] = a[pivotIdx], a[lo]
    pivot := a[lo]

    // 2. 双路扫描
    i, j := lo+1, hi
    for i <= j {
        for i <= j && a[i] <= pivot {
            i++
        }
        for i <= j && a[j] >= pivot {
            j--
        }
        if i < j {
            a[i], a[j] = a[j], a[i]
        }
    }
    // 3. 把 pivot 放到 j
    a[lo], a[j] = a[j], a[lo]

    // 4. 递归左右子区间
    quickSort(a, lo, j-1)
    quickSort(a, j+1, hi)
}
```

归并排序
```go
func mergeSort(a []int) []int {
    n := len(a)
    if n <= 1 {
        return a
    }
    mid := n / 2
    left  := mergeSort(a[:mid])
    right := mergeSort(a[mid:])

    // 合并两有序切片
    merged := make([]int, 0, n)
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            merged = append(merged, left[i])
            i++
        } else {
            merged = append(merged, right[j])
            j++
        }
    }
    merged = append(merged, left[i:]...)
    merged = append(merged, right[j:]...)
    return merged
}
```

#### 非比较排序简要示例
计数排序（整数且值域小）

```go
func countingSort(a []int, maxVal int) []int {
    cnt := make([]int, maxVal+1)
    for _, v := range a {
        cnt[v]++
    }
    for i := 1; i <= maxVal; i++ {
        cnt[i] += cnt[i-1]
    }
    out := make([]int, len(a))
    for i := len(a)-1; i >= 0; i-- {
        v := a[i]
        cnt[v]--
        out[cnt[v]] = v
    }
    return out
}
```

基数排序、桶排序思路与此类似，可根据具体数据结构补充

