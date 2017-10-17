#!/bin/bash

source ./dockerize/setenv.sh &&
docker logs -f $CSTM_DOCKER_CONTAINER_NAME