* 安装 Java（Elasticsearch 是基于 Java 的）：`sudo apt install openjdk-11-jre`
* 检查是否成功安装 Java：`java -version`
* 导入公钥并安装 APT 仓库：

        wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
        sudo sh -c 'echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list'

* 安装 Elasticsearch：`sudo apt install elasticsearch`
* 启动 Elasticsearch：`sudo systemctl start elasticsearch`
    * 通过访问 `http://localhost:9200/` 来确认 Elasticsearch是否成功运行，如果返回了一些 json 就说明成功运行
* 关闭 Elasticsearch： `sudo systemctl stop elasticsearch`
* 查看 Elasticsearch 运行状态： `sudo systemctl status elasticsearch`