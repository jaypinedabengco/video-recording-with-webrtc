#!/bin/bash

. /home/ec2-user/.bash_profile
source /home/ec2-user/.bash_profile

#Start PM2
cd /home/ec2-user/node-applications/video-recording-with-webrtc
npm run pm2_stop
npm run pm2_start