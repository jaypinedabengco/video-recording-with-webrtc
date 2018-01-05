#!/bin/bash

#Install Node
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 6.11.5
nvm use 6.11.5 #update node version

#Install PM2
npm install -g pm2
pm2 update