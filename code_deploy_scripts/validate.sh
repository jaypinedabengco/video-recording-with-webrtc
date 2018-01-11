#!/bin/sh -e

sleep 30

APPLICATION_HOST=127.0.0.1
APPLICATION_PORT=8081

#CHECK IF RUNNING
nc -zv $APPLICATION_HOST $APPLICATION_PORT

#UPDATE Environment Variable
cp /home/ec2-user/.bash_profile update_env_variable_for_testing.sh
source update_env_variable_for_testing.sh

#RUN Unit Test
cd /home/ec2-user/node-applications/video-recording-with-webrtc
npm test

## VALIDATE HEALTHCHECK
#GET_HEALTH_CHECK_RESULT
# HEALTH_STATUS=$(curl 'http://$APPLICATION_HOST:$APPLICATION_PORT/api/healthcheck') 

# #WRITE RESULT ON A JSON FILE
# rm -rf health_status.json
# touch health_status.json
# echo $HEALTH_STATUS >> health_status.json

# #STORE VERSION
# HEALTH_RESULT_VERSION=$(jq '.version' health_status.json)

# #STORE DB STATUS
# HEALTH_RESULT_REDIS_STATUS=$(jq '.redis.status' health_status.json)

# #VALIDATE REDIS
# if [ "$HEALTH_RESULT_REDIS_STATUS" != "1" ] then;
#     echo "Unable to connect to redis!" > logfile.log
#     echo $HEALTH_STATUS > logfile.log
# fi