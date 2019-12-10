#!/bin/sh
docker container rm -f $(docker container ls -aqf name=coupon)
docker volume rm -f $(docker volume ls -q)
