---
title: factory
date: '2025-09-03'
tags:
  - design-mod
summary: using namespace std;
---
## 工厂模式是什么
[推荐阅读](https://github.com/youngyangyang04/kama-DesignPattern/blob/main/DesignPattern/2-%E5%B7%A5%E5%8E%82%E6%96%B9%E6%B3%95%E6%A8%A1%E5%BC%8F.md)

## 示例题目的代码
cpp:

    # include <iostream>
    # include <vector>
    # include <memory>

    using namespace std;

    class Block
    {
    public:
        virtual void produce() = 0;
        virtual ~Block() = default;
    };

    class circleBlock: public Block
    {
    public:
        void produce() override
        {
            cout << "Circle Block" << endl;
        }
    };

    class squareBlock: public Block
    {
    public:
        void produce() override
        {
            cout << "Square Block" << endl;
        }
    };

    class BlockFactory
    {
    public:
        virtual unique_ptr<Block> createBlock() = 0;
        virtual ~BlockFactory() = default;
    };

    class circleBlockFactory: public BlockFactory
    {
    public:
        unique_ptr<Block> createBlock() override
        {
            return make_unique<circleBlock>();
        }
    };

    class squareBlockFactory: public BlockFactory
    {
    public:
        unique_ptr<Block> createBlock() override
        {
            return make_unique<squareBlock>();
        }
    };

    class BlockFactorySystem
    {
    private:
        vector<unique_ptr<Block>> blocks;

    public:
        void produceBlocks(BlockFactory* factory, int quantity)
        {
            for (int i = 0; i < quantity; i++)
            {
                auto block = factory->createBlock();
                block->produce();
                blocks.push_back(move(block));
            }
        }
    };

    int main()
    {
        BlockFactorySystem factorySystem;
        int productCount;

        cin >> productCount;

        for (int i = 0; i < productCount; i++)
        {
            string blockType;
            int blockNum;

            cin >> blockType >> blockNum;

            if (blockType == "Circle")
            {
                circleBlockFactory circle;
                factorySystem.produceBlocks(&circle, blockNum);
            }
            else
            {
                squareBlockFactory square;
                factorySystem.produceBlocks(&square, blockNum);
            }
        }

        return 0;
    }
