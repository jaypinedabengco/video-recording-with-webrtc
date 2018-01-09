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
# Set Names for AWS Parameter Store
# ---------------------

#Parameter Store Names
#DEFAULT IS FOR DEVELOPMENT
export PS_REGION="ap-southeast-1"
export PS_REDIS_HOST_NAME=""
export PS_REDIS_PORT_NAME=""
export PS_NODE_ENV_NAME=""
export USE_DOCKER_FOR_REDIS="false"

# ------------------------------------------
# Deployment Group Specific Environments (Development)
# ------------------------------------------
if [ "$DEPLOYMENT_GROUP_NAME" == "video-interview-POC-Deploy-Group-Dev" ]; then
	export USE_DOCKER_FOR_REDIS="true"
	export PS_NODE_ENV_NAME="video-interview-poc.dev.NODE_ENV"
fi
# ------------------------------------------
# Deployment Group Specific Environments (Stage)
# ------------------------------------------
if [ "$DEPLOYMENT_GROUP_NAME" == "video-interview-POC-Deploy-Group-Stage" ]; then
	export PS_NODE_ENV_NAME="video-interview-poc.stage.NODE_ENV"
	export PS_REDIS_HOST_NAME="video-interview-poc.stage.redis.host"
	export PS_REDIS_PORT_NAME="video-interview-poc.stage.redis.port"
fi

# ------------------------------------------
# GET CONTENTS FROM AWS Parameter Store
# ------------------------------------------
export PS_NODE_ENV_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_NODE_ENV_NAME --with-decryption --query Parameters[0].Value)

# Check if Docker is via AWS CACHE or just create a docker container locally
export PS_REDIS_HOST_VALUE=""
export PS_REDIS_PORT_VALUE=""

if [ "$USE_DOCKER_FOR_REDIS" == "true" ]; then
	# ------------
	# Create a docker component for redis
	# ------------
	local REDIS_DOCKER_NAME=packt-redis
	local REDIS_DOCKER_PORT=16379

	#Check if redis docker exists, then remove
	if [ "$(docker ps -q -f name=$REDIS_DOCKER_NAME)" ]; then
		docker rm -f $REDIS_DOCKER_NAME
	fi

	docker run --name $REDIS_DOCKER_NAME -p $REDIS_DOCKER_PORT:6379 -d redis:3.2.4 #start

	export PS_REDIS_HOST_VALUE=127.0.0.1 #local
	export PS_REDIS_PORT_VALUE=$REDIS_DOCKER_PORT
else 
	#Get From AWS Parameter Store
	export PS_REDIS_HOST_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_REDIS_HOST_NAME --with-decryption --query Parameters[0].Value)
	export PS_REDIS_PORT_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_REDIS_PORT_NAME --with-decryption --query Parameters[0].Value)
fi

# ---------------------
# SET VARIABLES
# ---------------------

source $BUILD_BASH_PROFILE_LOCATION #REFRESH 

set_environment_variable_to_bash_profile "BUILD_DEPLOYMENT_GROUP_NAME" $DEPLOYMENT_GROUP_NAME
set_environment_variable_to_bash_profile "APPLICATION_DIRECTORY" $APPLICATION_LOCATION
set_environment_variable_to_bash_profile "NODE_ENV" $PS_NODE_ENV_VALUE
set_environment_variable_to_bash_profile "VT_REDIS_HOST" $PS_VT_REDIS_HOST
set_environment_variable_to_bash_profile "VT_REDIS_PORT" $PS_VT_REDIS_PORT

source $BUILD_BASH_PROFILE_LOCATION #REFRESH

# add node to startup
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
    sudo sh -c "echo 'su -l $USER -c \"cd ~/node-applications/video-recording-with-webrtc;sh ./start_server.sh\"' >> /etc/rc.d/rc.local"
fi