#!/bin/bash

echo "DELETING...." &&
sh ./setenv &&
docker rm -f $CSTM_DOCKER_CONTAINER_NAME &&
echo "DELETED $CSTM_DOCKER_CONTAINER_NAME"