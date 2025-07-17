## 二叉树概述
**二叉树**（Binary Tree）是一种每个节点最多有两个子节点的数据结构

它的**基本特性**包括：

* 节点（Node）：包含数据域和指向左、右子节点的指针（或引用）
* 根节点（Root）：树的顶端节点，没有父节点
* 子节点与父节点：任一节点的下一级节点称为它的子节点，上一级节点称为父节点
* 叶子节点（Leaf）：没有子节点的节点
* 高度（Height）：从根到最深叶子的最长路径上的节点数（或边数）
* 深度（Depth）：从根到该节点的路径长度
* 空树：没有任何节点的树，常用 `nullptr`（C++）或 `nil`（Go）表示

二叉树的**分类**主要有：

* 满二叉树（Full/Strict Binary Tree）：每个节点要么是叶子，要么有且只有两个子节点
* 完全二叉树（Complete Binary Tree）：除了最底层，其余层节点数都达到最大，并且最底层的节点都集中在左侧
* 平衡二叉树（Balanced Binary Tree）：任意节点的左右子树高度差不超过1，例如 AVL 树、红黑树
* 二叉搜索树（BST，Binary Search Tree）：对任意节点，左子树所有节点的值都小于它，右子树所有节点的值都大于它，支持高效的查找、插入、删除操作

## 二叉树的基本操作与遍历
#### 遍历（Traversal）

* 前序（Pre-order）：访问节点 → 遍历左子树 → 遍历右子树
* 中序（In-order）：遍历左子树 → 访问节点 → 遍历右子树
* 后序（Post-order）：遍历左子树 → 遍历右子树 → 访问节点
* 层序（Level-order）：借助队列，按层自上而下、自左向右访问

#### 查找（Search）

* 在普通二叉树中，需要遍历所有节点，时间复杂度 `O(n)`
* 在二叉搜索树中，可利用节点有序性质，将时间复杂度降为 `O(h)`，其中 h 是树的高度

#### 插入与删除（Insert / Delete）

* 普通二叉树：未必有明确的“插入”位置，一般作为“完全二叉树”按层插入
* 二叉搜索树：在叶子或空子树位置插入；删除分三种情况：叶子节点、只有一个子节点、两个子节点（常用“后继”或“前驱”替代）

#### 复杂度

* 高度偏斜时（退化为链表），查找/插入/删除最坏 `O(n)`
* 对于平衡的二叉搜索树，平均和最坏均为 `O(logn)`

## C++ 中的二叉树实现
#### 节点定义

```cpp
template<typename T>
struct TreeNode {
    T val;                      // 节点存储的数据
    TreeNode* left;             // 指向左子节点
    TreeNode* right;            // 指向右子节点
    TreeNode(const T& x)
      : val(x), left(nullptr), right(nullptr) {}
};
```
####  插入与查找（BST 示例）

```cpp
template<typename T>
class BinarySearchTree {
public:
    TreeNode<T>* root;

    BinarySearchTree() : root(nullptr) {}

    // 插入节点
    void insert(const T& x) {
        root = insertRec(root, x);
    }

    // 递归插入
    TreeNode<T>* insertRec(TreeNode<T>* node, const T& x) {
        if (!node) return new TreeNode<T>(x);
        if (x < node->val)
            node->left = insertRec(node->left, x);
        else if (x > node->val)
            node->right = insertRec(node->right, x);
        return node;
    }

    // 查找节点
    TreeNode<T>* search(const T& x) {
        return searchRec(root, x);
    }

    TreeNode<T>* searchRec(TreeNode<T>* node, const T& x) {
        if (!node || node->val == x) return node;
        if (x < node->val) return searchRec(node->left, x);
        return searchRec(node->right, x);
    }
};
```

#### 遍历示例

```cpp
template<typename T>
void inorder(TreeNode<T>* node) {
    if (!node) return;
    inorder(node->left);
    std::cout << node->val << " ";
    inorder(node->right);
}
```

#### 智能指针优化
为了避免手动 `delete`，可使用 `std::unique_ptr`：

```cpp
#include <memory>
template<typename T>
struct Node {
    T val;
    std::unique_ptr<Node> left, right;
    Node(const T& x): val(x) {}
};
```

#### 应用场景
* 二叉搜索树（BST）：字典、集合实现；支持快速查找、范围查询
* 表达式树：计算器或编译器中用于解析和计算算术表达式
* 决策树：机器学习中的分类与回归树模型
* 堆（Heap）：通常以完全二叉树实现，支持优先级队列

## Go 语言中的二叉树实现
Go 语言因其内置垃圾回收和简洁的指针语法，对二叉树的实现更加轻量，自 Go 1.18 起支持泛型，可以写出类型安全的通用二叉树

#### 基本节点定义（无泛型）
```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func NewNode(v int) *TreeNode {
    return &TreeNode{Val: v}
}
```

#### 泛型节点定义（Go 1.18+）
```go
type TreeNodeT[T any] struct {
    Val   T
    Left  *TreeNodeT[T]
    Right *TreeNodeT[T]
}

func NewNodeT[T any](v T) *TreeNodeT[T] {
    return &TreeNodeT[T]{Val: v}
}
```

#### 插入与查找（BST 示例）
```go
// 插入（泛型版）
func Insert[T constraints.Ordered](node *TreeNodeT[T], v T) *TreeNodeT[T] {
    if node == nil {
        return NewNodeT(v)
    }
    if v < node.Val {
        node.Left = Insert(node.Left, v)
    } else if v > node.Val {
        node.Right = Insert(node.Right, v)
    }
    return node
}

// 查找
func Search[T constraints.Ordered](node *TreeNodeT[T], v T) *TreeNodeT[T] {
    if node == nil || node.Val == v {
        return node
    }
    if v < node.Val {
        return Search(node.Left, v)
    }
    return Search(node.Right, v)
}
```

备注：`constraints.Ordered` 来自 Go 标准库 `golang.org/x/exp/constraints`，用于约束泛型可比较类型

#### 遍历示例
```go
func InOrder[T any](node *TreeNodeT[T]) {
    if node == nil {
        return
    }
    InOrder(node.Left)
    fmt.Printf("%v ", node.Val)
    InOrder(node.Right)
}
```

#### Go 特色与优势
* 自动垃圾回收：无需手动管理内存，减少内存泄露风险
* 简洁的指针语法：`*TreeNode`、`&TreeNode{}`，易于上手
* 并发访问：可结合 `sync.RWMutex` 实现并发安全的树结构

#### 应用场景
* 与 C++ 类似，可用于**字典、表达式解析、决策模型**等
* 在 Go Web 服务中，可用于实现路由前缀树（Trie）或路由树，以高效匹配 URL 路径
* 在数据处理管道中，可用来组织分层数据或构建检索索引

## C++ 与 Go 的对比

| 特性 | C++ | Go |
| --- | --- | --- |
| 内存管理 | 手动（new/delete）或智能指针 | 自动垃圾回收 |
| 泛型支持 | 模板（template） | 泛型（Go 1.18+，constraints约束） |
| 语法复杂度 | 较高（指针、引用、模板元编程） | 较低（内置指针类型、简洁函数签名） |
| 并发机制 | 可用线程、锁、原子操作等 | 原生 goroutine + channel + sync |
| 性能 | 极高，可精细控制 | 较高，但有 GC 开销 |

## 总结
二叉树是基础且功能强大的树形结构，适用于各种需要分层组织、快速查找和有序存储的场景

在 C++ 中，可通过指针、类模板和智能指针精细控制内存及类型

在 Go 中，利用简洁语法、垃圾回收和泛型快速开发

理解二叉树的各种变体（BST、平衡树、满树、完全树）及其操作（遍历、插入、删除、查找）是掌握数据结构与算法的关键一步