#!/bin/bash

export BASH_LOCATION=/home/ec2-user/.bash_profile

#TEST if exists
echo "HELLO=$DEPLOYMENT_GROUP_NAME" >> $BASH_LOCATION

. $BASH_LOCATION
source $BASH_LOCATION

#Start PM2
cd /home/ec2-user/node-applications/video-recording-with-webrtc 

touch what_is_my_version3.txt
echo $(node -v) >> what_is_my_version3.txt
echo $(which node) >> what_is_my_version3.txt

#remove test
npm test &&
npm run pm2_stop &&
npm run pm2_start