#!/bin/bash

#Should add a logic here, that if on stage or prod, then 
#Redis should be accessible outside of EC2 Server. 

#If Development, then will create a docker container, then use it locally.

#Start a local redis from docker
# docker run --name packt-redis -p 16379:6379 -d redis:3.2.4

#TEMPORARY (Set Local Variables, should transfer to proper location)

export NODE_ENV=$DEPLOYMENT_GROUP_NAME
export VT_REDIS_HOST=video-i-poc-dev.zuvakz.0001.apse1.cache.amazonaws.com
export VT_REDIS_PORT=6379