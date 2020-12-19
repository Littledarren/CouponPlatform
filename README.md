# CouponPlatform

软件工程方法论大作业

# Update

## 后端运行
完全容器化的运行方式，简单省事。。
暂时有两种方法:
1.  进入scripts文件夹，执行`./cluster-run.sh  # 默认是后台执行`
2.  或者执行`docker-compose --compatiability up -V #只加V是重新构建容器。这时可以看到内部的log`


## 压力测试

进入scripts文件夹，执行./scripts/run-stress-test.sh
或者自己根据脚本内容写命令，也就一句话
