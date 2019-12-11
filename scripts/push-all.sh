#!/bin/sh
# images=( "db" "server" "pm2" "test" )
for image in "db" "server" "pm2" "test"
do
	docker image push sysu2019semcdfhlz/coupon-${image}
done
