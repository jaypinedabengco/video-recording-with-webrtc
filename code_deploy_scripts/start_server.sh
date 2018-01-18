#!/bin/bash

export BASH_LOCATION=/home/ec2-user/.bash_profile

#TEST if exists
echo "HELLO=$DEPLOYMENT_GROUP_NAME" >> $BASH_LOCATION

. $BASH_LOCATION
source $BASH_LOCATION

#Start PM2
cd /home/ec2-user/node-applications/video-recording-with-webrtc 
npm test &&
npm run pm2_stop &&
npm run pm2_start