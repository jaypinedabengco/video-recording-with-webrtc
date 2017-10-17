#!/bin/bash
echo "BUILDING...." &&
source ./dockerize/setenv.sh &&
docker build -t $CSTM_DOCKER_IMAGE_NAME . &&
echo "BUILT"