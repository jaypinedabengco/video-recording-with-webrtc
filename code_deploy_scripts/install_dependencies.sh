#!/bin/bash

#Install Node
curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
yum -y install nodejs 

#Install PM2
npm install -g pm2
pm2 update