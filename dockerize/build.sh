#!/bin/bash
echo "BUILDING...." &&
sh ./setenv &&
docker build -t $CSTM_DOCKER_IMAGE_NAME . &&
echo "BUILT"