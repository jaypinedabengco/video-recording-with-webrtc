#!/bin/bash

. ~/.bash_profile
source ~/.bash_profile

# TEST UPDATE ENV VARIABLE
PS_REGION=ap-southeast-1
export PS_NODE_ENV=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.NODE_ENV --with-decryption --query Parameters[0].Value)
export PS_VT_REDIS_HOST=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.redis.host --with-decryption --query Parameters[0].Value)
export PS_VT_REDIS_PORT=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.redis.port --with-decryption --query Parameters[0].Value)

#Start PM2
cd ~/node-application/video-recording-with-webrtc/
npm run pm2_stop
npm run pm2_start