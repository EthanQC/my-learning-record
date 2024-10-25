源代码：

    #include <iostream>
    #include <vector>
    #include <deque>
    #include <algorithm>
    #include <random>
    using namespace std;

    class attendent
    {
    public:
	    attendent(string name, deque<int> score): m_name(name), m_score(score)
	    {
    
	    }
	    string m_name;
	    deque<int> m_score;
    };

    void createAttendent(vector<attendent>& v)
    {
    	string nameSeed = "ABCDE";
    	string name = "";
    	for (int i = 0; i < 5; i++)
    	{
    		name = nameSeed[i];
    		deque<int> score;
    		attendent a(name, score);
    		v.push_back(a);
    	}
    }
    
    void attendentPrint(vector<attendent>& v)
    {
    	random_device rd;
    	mt19937 g(rd());
    	uniform_int_distribution<int> r(60, 100);
    
    	deque<int> d;
    
    	double accumulation = 0;
    	double average = 0;
    
    	for (vector<attendent>::iterator it = v.begin(); it != v.end(); it++)
    	{
    		for (int i = 0; i < 10; i++)
    		{
    			int randomNum = r(g);
    			int score = randomNum;
    			d.push_back(score);
    		}
    
    		sort(d.begin(), d.end());
    
    		d.pop_back();
    		d.pop_front();
    
    		cout << (*it).m_name << ": ";
    
    		for (int i = 0; i < d.size(); i++)
    		{
    			cout << d[i] << " ";
    			accumulation += d[i];
    		}
    
    		average = accumulation / d.size();
    		cout << "| " << average << endl;
    
    		d.clear();
    		accumulation = 0;
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
