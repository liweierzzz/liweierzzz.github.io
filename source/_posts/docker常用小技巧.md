---
title: docker常用的启动命令
tags:
  - docker
  - 经验分享
categories:
  - 编程经验
description: 本文主要介绍了常用的docker命令和docker的技巧
cover: https://bu.dusays.com/2024/07/11/668fb85d60988.jpg
abbrlink: c4278608
date: 2024-07-16 23:42:55
---



# 常用的Docker启动命令



## docker单机部署Java小技巧

在同级⽬录下准备⼀个dockerfile⽂件

```shell
FROM openjdk:8
ENV workdir=/home/wanwuCode/wanwu-code-bi
COPY . ${workdir}
WORKDIR ${workdir}
EXPOSE 8807
CMD ["java","-jar","wanwu-code-bi-0.0.1-SNAPSHOT.jar"]
```

>workdir={jar包放置的⽂件夹} CMD ["java" , "-jar" , "{jar包名称}"]

```shell
//先到⽂件夹⽬录下⾯
cd /home/wanwu-code
//进⾏项⽬打包 -t后⾯跟的是你项⽬打包的名字
docker build -f ./dockerfile -t wanwu-code .
//进⾏容器的运⾏ --name 后⾯是你想取的容器名字 紧跟着后⾯是 你上⾯打包的名字+:latest
//-p后⾯是你项⽬的端⼝号 如果不通过nginx代理出去想通过地址使⽤，就要到服务器防⽕墙进⾏
放⾏操作
docker run -d -p 8806:8806 --name "wanwu-code" wanwu-code:latest
//查看容器列表
docker ps -a
//如果查看容器是否启动成功或者失败 看控制台 容器id不⽤打全，前⼏位数就⾏
docker logs -f 容器id
//部署失败怎么删除容器
//找到容器id
//删除容器 容器id不⽤打全，前⼏位数就⾏
docker rm -f f416
```

## docker 的安装（Centos）

```shell
yum安装gcc相关环境
yum -y install gcc
yum -y install gcc-c++
#安装yum的⼯具
yum install -y yum-utils
#添加阿⾥云docker镜像地址
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/ce
ntos/docker-ce.repo
#更新yum软件包索引
yum makecache
#安装docker
yum install --allowerasing docker-ce docker-ce-cli containerd.io #
不要⽤yum install docker-ce docker-ce-cli containerd.io安装，centos8内置了pod
man容器会冲突（是⼀个跟docker差不多的容器，因为centos8放弃了对docker的⽀持，代替⽅案
就是podman）--allowerasing命令⽤于将要安装的包替代冲突的包
#启动docker
systemctl start docker
#开机⾃启
systemctl enable docker
```

### docker的停止

```shell
systemctl stop docker 
```

### docker 安装 WireGuard

```Plain Text
docker run -d \
 --name=wg-easy \
 -e WG_HOST=43.138.246.140 \
 -e PASSWORD=oo771901874 \
 -v /usr/local/src/wireguard:/etc/wireguard \
 -p 51820:51820/udp \
 -p 51821:51821/tcp \
 --cap-add=NET_ADMIN \
 --cap-add=SYS_MODULE \
 --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
 --sysctl="net.ipv4.ip_forward=1" \
 weejewel/wg-easy
 
```

---

### docker安装RabbitMQ

1. 使用[docker](https://so.csdn.net/so/search?q=docker&spm=1001.2101.3001.7020)查询[rabbitmq](https://so.csdn.net/so/search?q=rabbitmq&spm=1001.2101.3001.7020)的镜像

> docker search rabbitmq

2. 安装镜像

>如果需要安装其他版本在rabbitmq后面跟上版本号即可 docker pull rabbitmq:3.7.7-management 
>
>说明
>
>docker pull rabbitmq:版本号 -management 

> 安装name为rabbitmq的这里是直接安装最新的 docker pull rabbitmq

3. 根据下载的镜像创建和启动容器

```shell
docker run -di --name rabbitmq -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_D
EFAULT_PASS=admin -p 15672:15672 -p 5672:5672 -p 25672:25672 -p 61613:6161
3 -p 1883:1883 rabbitmq:management
```

>-d 后台运行容器；
>
>--name 指定容器名；
>
>-p 指定服务运行的端口（5672：应用访问端口；15672：控制台Web端口号）；
>
>-v 映射目录或文件；
>
>--hostname  主机名（RabbitMQ的一个重要注意事项是它根据所谓的 “节点名称” 存储数据，默认为主机名）；
>
>-e 指定环境变量；（RABBITMQ_DEFAULT_VHOST：默认虚拟机名；RABBITMQ_DEFAULT_USER：默认的用户名；
>
>RABBITMQ_DEFAULT_PASS：默认用户名的密码）

---

### docker 安装Mysql

1. 下载镜像

>docker pull mysql:xxx   下载指定版本的Mysql镜像 (xxx指具体版本号)

2. 创建Mysql容器并运行

```shell
# --name指定容器名字 -v⽬录挂载 -p指定端⼝映射 -e设置mysql参数 -d后台运⾏
docker run --name mysql -v /usr/local/mysql/data:/var/lib/mysql -e MYSQL_RO
OT_PASSWORD=lhc010516 -p 3306:3306 -d mysql:8.0.27
#进⼊docker⾥⾯mysql的⽬录
docker exec -it mysql /bin/bash
```

---

### docker 安装启动Elasticsearch、Kibana

```shell
# 存储和检索数据
docker pull elasticsearch:7.4.2
# 可视化检索数据
docker pull kibana:7.4.2
# 创建配置⽂件⽬录
mkdir -p /mydata/elasticsearch/config
# 创建数据⽬录
mkdir -p /mydata/elasticsearch/data
# 将/mydata/elasticsearch/⽂件夹中⽂件都可读可写
chmod -R 777 /mydata/elasticsearch/
# 配置任意机器可以访问 elasticsearch
echo "http.host: 0.0.0.0" >/mydata/elasticsearch/config/elasticsearch.yml
#启动Elasticsearch
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 \
-e "discovery.type=single-node" \
-e ES_JAVA_OPTS="-Xms64m -Xmx128m" \
-v /mydata/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch
/config/elasticsearch.yml \
-v /mydata/elasticsearch/data:/usr/share/elasticsearch/data \
-v /mydata/elasticsearch/plugins:/usr/share/elasticsearch/plugins \
-d elasticsearch:7.4.2
● -p 9200:9200 -p 9300:9300：向外暴露两个端⼝，9200⽤于HTTP REST API请求，9300
ES 在分布式集群状态下 ES 之间的通信端⼝；
● -e "discovery.type=single-node"：es 以单节点运⾏
● -e ES_JAVA_OPTS="-Xms64m -Xmx128m"：设置启动占⽤内存，不设置可能会占⽤当前系统
所有内存
● -v：挂载容器中的配置⽂件、数据⽂件、插件数据到本机的⽂件夹；
● -d elasticsearch:7.6.2：指定要启动的镜像
访问 IP:9200 看到返回的 json 数据说明启动成功。
#设置 Elasticsearch 随Docker启动
# 当前 Docker 开机⾃启，所以 ES 现在也是开机⾃启
docker update elasticsearch --restart=always
#启动可视化Kibana
docker run --name kibana \
-e ELASTICSEARCH_HOSTS=http://110.42.254.129:9200 \
-p 5601:5601 \
-d kibana:7.4.2
#设置 Kibana 随Docker启动
# 当前 Docker 开机⾃启，所以 kibana 现在也是开机⾃启
docker update kibana --restart=always
```

### docker安装minio

1. 寻找 Minio 镜像 
2. 下载Minio 镜像

```shell
docker pull minio/minio:RELEASE.2022-06-20T23-13-45Z.fips #下载指定版本的 Minio 镜像 (xxx 指具体版本号)
```

3. 安装并启动minio

```shell
docker run -d -p 9000:9000 -p 9001:9001 --name minio --restart=alwa
ys --privileged=true -v /home/minio/config:/root/.minio -v /home/mini
o/data:/data -e "MINIO_ROOT_USER=miniocong" -e "MINIO_ROOT_PASSWORD=min
iocong" minio/minio server /data --console-address ":9001" --address ":90
00
```



### docker 安装 Nacos

