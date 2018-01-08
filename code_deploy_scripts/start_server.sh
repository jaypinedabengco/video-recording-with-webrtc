#!/bin/bash

sleep 5

. ~/.bash_profile
source ~/.bash_profile
. /home/ec2-user/.bash_profile
source /home/ec2-user/.bash_profile

sleep 5

#Start PM2
cd ~/node-application/video-recording-with-webrtc/
npm run pm2_stop
npm run pm2_start