#!/bin/bash


serverIMG="sysu2019semcdfhlz/coupon-rm:4node"
dbIMG="sysu2019semcdfhlz/coupon-db"
# test代码可以统一用我的镜像名，但是可以本地构建一下
testIMG="littledarren/coupon_test"

set -e
cd .. &&  echo "当前工作目录 `pwd`" 
echo "BUILDING... ${serverIMG}"
docker build -t ${serverIMG} -f ./Dockerfile .
echo "BUIDING... ${dbIMG}"
docker build -t ${dbIMG} -f ./dockerfiles/Dockerfile-db .
echo "BUIDING... ${testIMG}"
docker build -t ${testIMG} -f ./dockerfiles/Dockerfile-test .

echo "然后就能用了，如果发现云端的镜像不太对劲，请联系我"
