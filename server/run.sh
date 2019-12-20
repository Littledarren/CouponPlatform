#!/bin/sh
set -e
set -u
NUM_NODE=$1
pm2 start /server/src/messageQueue.js
pm2 start pm2-${1}.json --no-daemon
