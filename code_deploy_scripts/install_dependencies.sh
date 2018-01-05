#!/bin/bash

#Install Node
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 6.11.5
nvm use 6.11.5 #update node version

#Set Application Directory, based on appspec.yml
export APPLICATION_DIRECTORY="/home/ec2-user/node-application/video-recording-with-webrtc/"


    