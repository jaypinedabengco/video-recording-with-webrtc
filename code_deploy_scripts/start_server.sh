#!/bin/bash

source /home/ec2-user/.bash_profile
source /home/ec2-user/.bashrc

#Start PM2
cd $APPLICATION_DIRECTORY
npm run pm2_stop
npm run pm2_start