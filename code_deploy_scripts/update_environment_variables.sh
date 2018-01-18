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


# ---------------------
# Utilities
# ---------------------

#Rebuild Bash Profile
rm -rf $BUILD_BASH_PROFILE_LOCATION #Remove Bash Profile
touch $BUILD_BASH_PROFILE_LOCATION #Create Bash Profile

#Add initial content to Bash profile
echo "#!/bin/bash" >> $BUILD_BASH_PROFILE_LOCATION

# Tool for setting environment variable to Bash profile
set_environment_variable_to_bash_profile(){
	local variable_name=$1
	local variable_value=$2
	echo "export $variable_name=$variable_value" >> $BUILD_BASH_PROFILE_LOCATION
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
export PS_NODE_ENV_NAME="video-interview-poc.dev.NODE_ENV"
export PS_DB_HOST_NAME="video-interview-poc.dev.DB_HOST"
export PS_DB_USER_NAME="video-interview-poc.dev.DB_USER"
export PS_DB_PASSWORD_NAME="video-interview-poc.dev.DB_PASSWORD"
export PS_DB_NAME_NAME="video-interview-poc.dev.DB_NAME"
export USE_DOCKER_FOR_REDIS="false"

# ------------------------------------------
# Deployment Group Specific Environments (Development)
# ------------------------------------------
if [ "$DEPLOYMENT_GROUP_NAME" == "development" ]; then
	export USE_DOCKER_FOR_REDIS="true" #Comment if AWS Elasticache Redis is implemented
fi
# ------------------------------------------
# Deployment Group Specific Environments (Staging)
# ------------------------------------------
if [ "$DEPLOYMENT_GROUP_NAME" == "staging" ]; then
	export USE_DOCKER_FOR_REDIS="true" #Comment if AWS Elasticache Redis is implemented
	export PS_NODE_ENV_NAME="video-interview-poc.stage.NODE_ENV"
	export PS_DB_HOST_NAME="video-interview-poc.stage.DB_HOST"
	export PS_DB_USER_NAME="video-interview-poc.stage.DB_USER"
	export PS_DB_PASSWORD_NAME="video-interview-poc.stage.DB_PASSWORD"
	export PS_DB_NAME_NAME="video-interview-poc.stage.DB_NAME"	
fi
# ------------------------------------------
# Deployment Group Specific Environments (Production)
# ------------------------------------------
if [ "$DEPLOYMENT_GROUP_NAME" == "production" ]; then
	export USE_DOCKER_FOR_REDIS="true" #Comment if AWS Elasticache Redis is implemented
	export PS_NODE_ENV_NAME="video-interview-poc.prod.NODE_ENV"
	export PS_DB_HOST_NAME="video-interview-poc.prod.DB_HOST"
	export PS_DB_USER_NAME="video-interview-poc.prod.DB_USER"
	export PS_DB_PASSWORD_NAME="video-interview-poc.prod.DB_PASSWORD"
	export PS_DB_NAME_NAME="video-interview-poc.prod.DB_NAME"		
fi

# ------------------------------------------
# GET CONTENTS FROM AWS Parameter Store
# ------------------------------------------
export PS_NODE_ENV_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_NODE_ENV_NAME --with-decryption --query Parameters[0].Value)
export PS_DB_HOST_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_DB_HOST_NAME --with-decryption --query Parameters[0].Value)
export PS_DB_USER_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_DB_USER_NAME --with-decryption --query Parameters[0].Value)
export PS_DB_PASSWORD_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_DB_PASSWORD_NAME --with-decryption --query Parameters[0].Value)
export PS_DB_NAME_VALUE=$(aws ssm get-parameters --region $PS_REGION --names $PS_DB_NAME_NAME --with-decryption --query Parameters[0].Value)	

# Check if Docker is via AWS CACHE or just create a docker container locally
export PS_REDIS_HOST_VALUE=""
export PS_REDIS_PORT_VALUE=""

# Will Create a Local Redis Container from Docker
if [ "$USE_DOCKER_FOR_REDIS" == "true" ]; then
	# ------------
	# Create a docker component for redis
	# ------------
	REDIS_DOCKER_NAME=packt-redis
	REDIS_DOCKER_PORT=6379

	#Check if redis docker exists, then remove
	if [ "$(docker ps -q -a -f name=$REDIS_DOCKER_NAME)" ]; then
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
# SET VALUES TO BASH PROFILE
# ---------------------

set_environment_variable_to_bash_profile "AWS_BUILD_DEPLOYMENT_GROUP_NAME" $DEPLOYMENT_GROUP_NAME
set_environment_variable_to_bash_profile "AWS_BUILD_DEPLOYMENT_ID" $DEPLOYMENT_ID
set_environment_variable_to_bash_profile "APPLICATION_DIRECTORY" $APPLICATION_LOCATION
set_environment_variable_to_bash_profile "NODE_ENV" $PS_NODE_ENV_VALUE
set_environment_variable_to_bash_profile "VT_REDIS_HOST" $PS_REDIS_HOST_VALUE
set_environment_variable_to_bash_profile "VT_REDIS_PORT" $PS_REDIS_PORT_VALUE

#DB
set_environment_variable_to_bash_profile "VT_DB_HOST" $PS_DB_HOST_VALUE
set_environment_variable_to_bash_profile "VT_DB_USERNAME" $PS_DB_USER_VALUE
set_environment_variable_to_bash_profile "VT_DB_PASSWORD" $PS_DB_PASSWORD_VALUE
set_environment_variable_to_bash_profile "VT_DB_NAME" $PS_DB_NAME_VALUE
set_environment_variable_to_bash_profile "VT_DB_PORT" 3306

# add node to startup 
# will also refresh environment variable on bash profile
# because refresh is on the start_server.sh script
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
    sudo sh -c "echo 'su -l $USER -c \"cd ~/node-applications/video-recording-with-webrtc;sh ./start_server.sh\"' >> /etc/rc.d/rc.local"
fi