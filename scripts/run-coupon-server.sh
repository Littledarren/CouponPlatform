#!/bin/sh
set -e
PARENTDIR=$(cd `dirname $0` && pwd | rev | cut -c 9- | rev)
# echo ${PARENTDIR}
# docker run -it --rm --name coupon-server --mount type=bind,source=${PARENTDIR}/server,target=/server --network coupon-net node:12.13.1-alpine3.10 /bin/sh
docker run -itd --rm --name coupon-server -p 3000:3000 \
	--mount type=bind,source=${PARENTDIR}/server,target=/server \
	--network coupon-net \
	node:12.13.1-alpine3.10 /bin/sh -c "cd /server && npm i && node bin/www" 
