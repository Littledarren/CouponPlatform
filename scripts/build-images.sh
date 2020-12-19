#!/bin/bash

echo "BUILDING... littledarren/coupon_server:optimize-pure-db"
cd .. && docker build -t littledarren/coupon_server:optimize-pure-db -f ./Dockerfile .

echo "然后就能用了，如果发现云端的镜像不太对经，请联系我"
