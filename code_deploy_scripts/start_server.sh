#!/bin/bash

source /home/ec2-user/.bash_profile
source /home/ec2-user/.bashrc

#Start PM2
pm2 start bin/www 