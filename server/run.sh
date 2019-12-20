#!/bin/sh
set -e
set -u
NUM_NODE=$1
pm2 start pm2.json --no-daemon
