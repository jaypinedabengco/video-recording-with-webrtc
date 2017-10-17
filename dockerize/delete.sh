#!/bin/bash

echo "DELETING...." &&
source ./dockerize/setenv.sh &&
docker rm -f $CSTM_DOCKER_CONTAINER_NAME &&
echo "DELETED $CSTM_DOCKER_CONTAINER_NAME"