#!/bin/sh
set -e
cd ../../docker-composes
ln -sf 1-pm2-1-db.yml docker-compose.yml
docker-compose up -dV
docker run -it --rm --name coupon-stress-test sysu2019semcdfhlz/coupon-test
docker-compose down
