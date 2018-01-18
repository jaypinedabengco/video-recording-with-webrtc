#!/bin/sh -e
sleep 10

#CONFIGURATIONS
BASH_PROFILE_LOCATION=/home/ec2-user/.bash_profile
APPLICATION_DIRECTORY=/home/ec2-user/node-applications/video-recording-with-webrtc
APPLICATION_HOST=127.0.0.1
APPLICATION_PORT=8081

#CHECK IF RUNNING
nc -zv $APPLICATION_HOST $APPLICATION_PORT

#UPDATE Environment Variable
source $BASH_PROFILE_LOCATION

#RUN Unit Test
# cd $APPLICATION_DIRECTORY
# npm test

## VALIDATE HEALTHCHECK
#GET_HEALTH_CHECK_RESULT
HEALTH_STATUS=$(curl 'http://$APPLICATION_HOST:$APPLICATION_PORT/api/healthcheck') 

# #WRITE RESULT ON A JSON FILE
rm -rf health_status.json
touch health_status.json
echo $HEALTH_STATUS >> health_status.json

# #STORE VERSION
HEALTH_RESULT_VERSION=$(jq '.version' health_status.json)

# #STORE DB STATUS
HEALTH_RESULT_REDIS_STATUS=$(jq '.redis.status' health_status.json)
HEALTH_RESULT_DB_STATUS=$(jq '.db.status' health_status.json)


# #VALIDATE REDIS
if [ "$HEALTH_RESULT_REDIS_STATUS" != "1" ] then;
    echo "Unable to connect to redis!" > logfile.log
    echo $HEALTH_STATUS > logfile.log
    exit 125
fi

# #VALIDATE DB
if [ "$HEALTH_RESULT_DB_STATUS" != "12123" ] then;
    echo "Unable to connect to db!" > logfile.log
    echo $HEALTH_STATUS > logfile.log
    exit 125
fi