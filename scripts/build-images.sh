#!/bin/bash


# server镜像名称
serverIMG="littledarren/coupon_server"
# 数据库镜像名称
dbIMG="littledarren/coupon_db"
# test镜像名称
testIMG="littledarren/coupon_test"

set -e
cd .. &&  echo "当前工作目录 `pwd`" 
echo "BUILDING... ${serverIMG}"
docker build -t ${serverIMG} -f ./Dockerfile .
echo "BUIDING... ${dbIMG}"
docker build -t ${dbIMG} -f ./dockerfiles/Dockerfile-db .
echo "BUIDING... ${testIMG}"
docker build -t ${testIMG} -f ./dockerfiles/Dockerfile-test .

echo "执行完毕"
