源代码：

    #include <iostream>
    #include <vector>
    #include <deque>
    #include <algorithm> //包含标准算法库
    #include <random> //包含random头文件以生成随机数
    using namespace std;

    class attendent //创建参赛者类
    {
    public:
	    attendent(string name, deque<int> score): m_name(name), m_score(score) //构造函数赋初值
	    {
    
	    }
	    string m_name;
	    deque<int> m_score;
    };

    void createAttendent(vector<attendent>& v) //创建一个函数来实例化attendent类的对象
    {
    	string nameSeed = "ABCDE"; //参赛选手种子库
    	string name = "";
    	for (int i = 0; i < 5; i++)
    	{
    		name = nameSeed[i]; //通过string容器为选手名字复制
    		deque<int> score;
    		attendent a(name, score);
    		v.push_back(a); //将选手放进vector容器中
    	}
    }
    
    void attendentPrint(vector<attendent>& v) //创建一个函数来打印参赛选手和每个选手的数据
    {
    	random_device rd; //用于生成真随机数
    	mt19937 g(rd()); //一个常用的梅森旋转器引擎，用来生成高质量的随机数
    	uniform_int_distribution<int> r(60, 100); //定义一个从60到100的整数分布
    
    	deque<int> d;
    
    	double accumulation = 0;
    	double average = 0;
    
    	for (vector<attendent>::iterator it = v.begin(); it != v.end(); it++)
    	{
    		for (int i = 0; i < 10; i++)
    		{
    			int randomNum = r(g); 用一个变量来接收这个随机数
    			int score = randomNum;
    			d.push_back(score); //将分数存进deque容器中
    		}
    
    		sort(d.begin(), d.end()); //利用标准算法库中的sort函数对选手成绩进行排序
    
    		d.pop_back(); //去掉最高分
    		d.pop_front(); //去掉最低分
    
    		cout << (*it).m_name << ": ";
    
    		for (int i = 0; i < d.size(); i++)
    		{
    			cout << d[i] << " ";
    			accumulation += d[i]; //对选手成绩求和
    		}
    
    		average = accumulation / d.size(); //求平均值
    		cout << "| " << average << endl;
    
    		d.clear(); //清空当前deque容器
    		accumulation = 0; //将求和置零
    	}
    }
    
    int main()
    {
    
    	vector<attendent> v;
    	createAttendent(v);
    	attendentPrint(v);
    
    	system("pause");
    
    	return 0;
    
    }
