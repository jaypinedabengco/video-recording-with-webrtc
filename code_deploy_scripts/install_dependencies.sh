#!/bin/bash

#Install Node
curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
yum -y install nodejs 
# yum -y install jq #for JSON Parsing

#Install PM2
npm install -g pm2
npm install -g mocha
pm2 update