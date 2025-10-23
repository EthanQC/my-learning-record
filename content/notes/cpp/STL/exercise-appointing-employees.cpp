// STL小练习：分配员工：
#include <iostream>
#include <map>
#include <vector>
#include <random>
using namespace std;

class employee // 创建员工类
{
public:
    employee(string name, int salary): m_name(name), m_salary(salary) {}
    string m_name;
    int m_salary;
};
    
void createEmployee(vector<employee>& v) // 创建一个创建员工的函数
{
    string nameSeed = "ABCDEFGHIJ";
    // 给员工名字赋值
    for (int i = 0; i < 10; i++)
    {
    	employee e("", 0);
    	e.m_name = nameSeed[i];
    	v.push_back(e);
    }
}
    
void assignWork_and_print(vector<employee>& v) // 创建一个分配部门并打印的函数
{
    multimap<string, employee> m1;

    // 引入随机数
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> rand1(1, 3);
    uniform_int_distribution<> rand2(5000, 15000);

    // 为员工随机分配部门
    for (int i = 0; i < v.size(); i++)
    {
    	int random1 = rand1(gen);
    	int random2 = rand2(gen);
    
    	string department;
    	if (random1 == 1)
    	{
    		department = "策划";
    	}
    	else if (random1 == 2)
    	{
    		department = "美术";
    	}
    	else
    	{
    		department = "研发";
    	}
    
    	v[i].m_salary = random2; // 随机分配工资
    	m1.insert(make_pair(department, v[i])); // 放入multimap容器中
    
    }
    
    // 利用auto创建记录位置的变量
    auto pos1 = m1.equal_range("策划");
    auto pos2 = m1.equal_range("美术");
    auto pos3 = m1.equal_range("研发");

    // 打印输出
    cout << "策划： " << endl;
    for (auto it = pos1.first; it != pos1.second; it++)
    {
    	cout << it->second.m_name << " | " << it->second.m_salary << endl;
    }
    
    cout << "美术： " << endl;
    for (auto it = pos2.first; it != pos2.second; it++)
    {
    	cout << it->second.m_name << " | " << it->second.m_salary << endl;
    }
    
    
    cout << "研发： " << endl;
    for (auto it = pos3.first; it != pos3.second; it++)
    {
    	cout << it->second.m_name << " | " << it->second.m_salary << endl;
    }
}
    
int main()
{
    
    vector<employee> v1;
    createEmployee(v1);
    assignWork_and_print(v1);
    
    system("pause");
    
    return 0;
    
}
