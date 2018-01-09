#!/bin/bash
set -e

# ####################################
# SET ENVIRONMENT VARIABLES
# ####################################

# ------------------------
# Build Variables
# ------------------------
export APPLICATION_LOCATION=/home/ec2-user/node-applications/video-recording-with-webrtc
export BUILD_BASH_PROFILE_LOCATION=/home/ec2-user/.bash_profile
rm -rf $BUILD_BASH_PROFILE_LOCATION
touch $BUILD_BASH_PROFILE_LOCATION

# ---------------------
# Utilities
# ---------------------

# Will be used to automatically update environment variables
set_environment_variable_to_bash_profile(){
	local variable_name=$1
	local variable_value=$2

	hasEnv=`grep "export $variable_name" /home/ec2-user/.bash_profile | cat`
	if [ -z "$hasEnv" ]; then
   		echo "export $variable_name=$variable_value" >> /home/ec2-user/.bash_profile
		source /home/ec2-user/.bash_profile
	else
        local old_variable_content=${!variable_name}
        sed -i "/export $variable_name=\b/c\export $variable_name=$variable_value" /home/ec2-user/.bash_profile
		source /home/ec2-user/.bash_profile	    
	fi
}

# --------
# GOTO application location
# --------
cd $APPLICATION_LOCATION

# ---------------------
# GET CONTENTS FROM AWS Parameter Store
# ---------------------
PS_REGION=ap-southeast-1

PS_NODE_ENV=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.NODE_ENV --with-decryption --query Parameters[0].Value)

# ------------------------------------------
# Deployment Group Specific Environments
# ------------------------------------------
if [ "$DEPLOYMENT_GROUP_NAME" == "video-interview-POC-Deploy-Group-Dev" ]; then
	# ------------
	# Create a docker component for redis
	# ------------
	REDIS_DOCKER_NAME=packt-redis
	REDIS_DOCKER_PORT=16379

	#Check if redis docker exists
	if [ ! "$(docker ps -q -f name=$REDIS_DOCKER_NAME)" ]; then
		# cleanup
		docker rm -f $REDIS_DOCKER_NAME
	fi

	#start
	docker run --name $REDIS_DOCKER_NAME -p $REDIS_DOCKER_PORT:6379 -d redis:3.2.4

	PS_VT_REDIS_HOST=127.0.0.1
	PS_VT_REDIS_PORT=16379
else
	#Get Redis Config from stored parameters
	PS_VT_REDIS_HOST="SET REDIS HOST FOR PROD HERE"
	PS_VT_REDIS_PORT="SET REDIS PORT FOR PROD HERE"
fi

# ---------------------
# SET VARIABLES
# ---------------------

source $BUILD_BASH_PROFILE_LOCATION #REFRESH 

set_environment_variable_to_bash_profile "BUILD_DEPLOYMENT_GROUP_NAME" $DEPLOYMENT_GROUP_NAME
set_environment_variable_to_bash_profile "APPLICATION_DIRECTORY" $APPLICATION_LOCATION
set_environment_variable_to_bash_profile "NODE_ENV" $PS_NODE_ENV
set_environment_variable_to_bash_profile "VT_REDIS_HOST" $PS_VT_REDIS_HOST
set_environment_variable_to_bash_profile "VT_REDIS_PORT" $PS_VT_REDIS_PORT

source $BUILD_BASH_PROFILE_LOCATION #REFRESH


# add node to startup
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
    sudo sh -c "echo 'su -l $USER -c \"cd ~/node-applications/video-recording-with-webrtc;sh ./start_server.sh\"' >> /etc/rc.d/rc.local"
fi