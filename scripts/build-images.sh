#!/bin/bash

set -e
cd .. &&  echo "当前工作目录 `pwd`" 
echo "BUILDING... littledarren/coupon_server:optimize-lock-interval"
docker build -t littledarren/coupon_server:optimize-lock-interval -f ./Dockerfile .
echo "BUIDING... littledarren/coupon_db"
docker build -t littledarren/coupon_db -f ./dockerfiles/Dockerfile-db .
echo "BUIDING... littledarren/coupon_test"
docker build -t littledarren/coupon_test -f ./dockerfiles/Dockerfile-test .

echo "然后就能用了，如果发现云端的镜像不太对劲，请联系我"
