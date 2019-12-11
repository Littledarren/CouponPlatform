#!/bin/sh
./build-db-image.sh
./build-server-image.sh
./build-pm2-image.sh
./build-test-image.sh
