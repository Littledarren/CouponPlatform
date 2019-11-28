#!/bin/bash
# set -e
PARENTDIR=$(cd `dirname $0` && pwd | rev | cut -c 9- | rev)
echo -e "\nTrying to create docker network 'coupon-net'...\n** if it exists, an error message will display, but you can ignore it.\n"
docker network create -d bridge coupon-net
echo -e "\ndocker network 'coupon-net is ready.'"
if [ ! -d ${PARENTDIR}/data ]; then
	mkdir -p ${PARENTDIR}/data/db
	mkdir ${PARENTDIR}/data/configdb
fi
docker run -d --rm --name coupon-db --network coupon-net \
	--mount type=bind,source=${PARENTDIR}/data/db,target=/data/db \
	--mount type=bind,source=${PARENTDIR}/data/configdb,target=/data/configdb \
	mongo:4.2.1-bionic
