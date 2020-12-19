#!/bin/bash

echo "BUILDING... littledarren/coupon_server:optimize-lock-interval"
cd .. && docker build -t littledarren/coupon_server:optimize-lock-interval -f ./Dockerfile .

echo "然后就能用了，如果发现云端的镜像不太对劲，请联系我"
