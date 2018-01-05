#!/bin/bash

source ~/.bash_profile

#Start PM2
cd ~/node-application/video-recording-with-webrtc/
echo "LOCATION $APPLICATION_DIRECTORY"
echo "PRESENT WORKING DIRECTORY"
pwd
echo "END..."
npm run pm2_stop
npm run pm2_start