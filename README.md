# aiologs-ui
### 配套日志记录组件aiologs所记录的日志的webui，提供浏览和搜索功能
> 此套webui是针对aiologs日志系统开发的套件。如果你恰好使用aiologs并且指定了elaticsearch为日志仓库，那么你可以直接使用它
#### 我们推荐在docker中使用。
我们默认已经安装了docker
1. 从当前项目中找到Dockerfile，把它拷贝到你的服务器上
2. 执行
```
docker build -t logsui:v1  -f Dockerfile .
```
等待构建完成。
3. 运行docker
```
docker run --name logsui --restart always  -d  -e ESIP=http://192.168.88.103:9200/  -p 8231:3000 logsui:v1
```
其中
```
-e ESIP=http://192.168.88.103:9200/ # 这里地址替换为你的elaticsearch rest api 地址
 -p 8231:3000 # 把8231 替换为你暴露的端口
```
执行完毕你可以成功访问他。
浏览器输入127.0.0.1:8231(你的端口),可以进行日志的查询。


#### 如果不想使用docker的方式，我们也提供了其他方式
1. 克隆档案库到本地
2. 确保安装了node 
3. 在更目录下运行执行 
```
ESIP=http://192.168.88.103:9200  yarn start 
```
网址替换为你自己的elaticsearch rest api 地址
接下来就可以直接使用他
默认端口是127.0.0.1:3000
当然你可以通过
```
ESIP=http://192.168.88.103:9200  PORT=3001 yarn start 
```
来修改网站的端口

####其他
项目的前端代码在根目录下src中。
