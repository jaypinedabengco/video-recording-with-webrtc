#!/bin/bash

#Set Application Directory, based on appspec.yml
export APPLICATION_DIRECTORY="/home/ec2-user/node-application/video-recording-with-webrtc/"
export NODE_ENV=$DEPLOYMENT_GROUP_NAME
export VT_REDIS_HOST=video-i-poc-dev.zuvakz.0001.apse1.cache.amazonaws.com
export VT_REDIS_PORT=6379