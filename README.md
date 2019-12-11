# CouponPlatform

软件工程方法论大作业

## 目录结构

- `server`文件夹下存放了服务端的源码
- `scripts`文件夹下存放了运行容器集群的若干脚本
- 当前目录下的若干`Dockerfile-xx`对应的是每个镜像的Dockerfile

## 运行服务

服务启动后将运行在本机的3000端口上，通过`localhost:3000`即可访问。

### 主机环境

1. 首先启动mongodb
2. 然后启动服务，执行以下命令：
```shell
$ cd server
$ npm i --registry=https://registry.npm.taobao.org
$ npm run start
```
默认监听3000端口，运行`npm run start`之后输出`Listening on port 3000`，且30秒之后无报错即正常启动并成功连接到了数据库。

### 容器环境

> 为了确保始终运行的是最新代码，这一步最好使用脚本在本地构建镜像，不要直接从仓库拉镜像

```shell
$ git clone https://github.com/2019FallSem-cdfhlz/CouponPlatform.git sem
$ cd sem/scripts
$ ./build-all.sh
# 等待所有镜像构建完成之后再进行下一步
```

构建好镜像之后，在本地启动也有两种方式，一种是使用`docker-compose`命令直接启动，另外一种是手动启动。

#### docker-compose

```shell
$ cd sem/scripts
$ ./cluster-run.sh
```

执行该脚本后，当前终端会由`docker-compose`输出各容器的日志信息。输入`Ctrl+C`即可结束运行。

#### 手动启动

```shell
$ docker network create -d bridge coupon-net
$ docker run -d --rm --name coupon-db --network coupon-net coupon-db
$ docker run -itd --rm --name coupon-pm2 -p 3000:3000 --network coupon-net sysu2019semcdfhlz/coupon-pm2
```

上述命令会以后台方式启动数据库和服务端两个容器。

#### 特殊启动

`sysu2019semcdfhlz/coupon-db`、`sysu2019semcdfhlz/coupon-server`这两个容器默认的启动命令都是直接启动服务，如果你有特殊的需要，可以在`docker run`命令的最后输入自己的命令来执行相应的操作，下面简单说明。

数据库容器一般不需要在启动时有特殊操作，因此按照上面的方式正常启动即可。如果想要查看数据库容器内部的一些信息，可以通过以下命令进入数据库容器：

```shell
$ docker exec -it coupon-db /bin/sh
```

然后执行想要的操作即可。

对于node容器，假如你现在想做单元测试，则需要在启动容器时让它先别直接启动服务。可以通过以下命令来启动node容器：

```shell
$ docker run -it --rm --name coupon-pm2 -p 3000:3000 --network coupon-net sysu2019semcdfhlz/coupon-pm2 /bin/sh
```

然后执行想要的操作即可。


## 测试

测试包括了单元测试和压力测试。

### 单元测试

首先启动mongo数据库，然后执行：

```shell
$ cd server
$ npm i --only=dev

# 默认使用3011端口
$ npm run test
```

### 压力测试

```shell
$ cd server/stressTest && node index.js
```

## Troubleshooting

如果运行Node容器时提示连接不到数据库，请检查`server/src/config.js`中`module.exports`的`db`字段：
- 主机环境下，将其修改为`localhost`
- 容器环境下，将其修改为`coupon-db`（对应mongo容器的容器名，即`--name`指定的名词）

