#!/bin/sh
set -e
cd ../docker-composes
docker-compose --compatibility up -dV
