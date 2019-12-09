# CouponPlatform

软件工程方法论大作业

## 关于文档

项目相关的文档请访问 http://shendianjiao.cn:8080 ，对应的仓库地址及编辑文档的说明请查看仓库 https://github.com/2019FallSem-cdfhlz/CouponPlatformDocs 。

## 目录结构

- `server`文件夹下存放了服务端的源码
- `data`文件夹下存放的是容器环境下mongoDB挂载的存储层，可实现数据的持久化，子目录按照Docker官方提供的mongoDB Dockerfile设定
- `scripts`文件夹下存放了运行容器集群的若干脚本

## 启动方法

```
$ cd server

// 如果这一步速度太慢请将npm源更换为淘宝源
$ npm i

// 默认监听3000端口
$ npm run start
```

> 输出`Listening on port 3000`则服务已启动

## 使用容器

### 在本地创建并运行镜像

```shell
git clone https://github.com/2019FallSem-cdfhlz/CouponPlatform.git coupon-server
cd coupon-server
docker build -t coupon-server .
docker run -it --rm --name coupon-server -p 3000:3000 coupon-server
```

### 从Dockerhub拉取镜像并运行

```shell
docker run -it --rm --name coupon-server -p 3000:3000 sysu2019semcdfhlz/coupon-server
```
## 单元测试

```
$ cd server

$ npm i --only=dev

// 默认使用3011端口
$ npm run test
```

## Troubleshooting

如果运行Node容器时提示连接不到数据库，请检查`server/src/config.js`中`module.exports`的`db`字段：
- 主机环境下，将其修改为`localhost`
- 容器环境下，将其修改为`coupon-db`（对应mongo容器的容器名，即`--name`指定的名词）

