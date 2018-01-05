#!/bin/bash

source /home/ec2-user/.bash_profile
source /home/ec2-user/.bashrc

#Start PM2
cd /home/ec2-user/node-application/video-recording-with-webrtc/
echo "LOCATION $APPLICATION_DIRECTORY"
echo "PRESENT WORKING DIRECTORY"
pwd
echo "END..."
npm run pm2_stop
npm run pm2_start