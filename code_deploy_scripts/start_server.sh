#!/bin/bash

. ~/.bash_profile
source ~/.bash_profile

#Start PM2
cd ~/node-application/video-recording-with-webrtc/
npm run pm2_stop
npm run pm2_start