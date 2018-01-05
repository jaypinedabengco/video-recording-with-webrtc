#!/bin/bash

# ####################################
# SET ENVIRONMENT VARIABLES
# ####################################

# ---------------------
# Utilities
# ---------------------

# Will be used to automatically update environment variables
set_environment_variable_to_bash_profile(){
	local variable_name=$1
	local variable_value=$2

	if env | grep -q ^"$variable_name"=
	then
		local old_variable_content=${!variable_name}
	  	echo env variable is already exported
	  	echo "export $variable_name=$old_variable_content"
	  	echo "export $variable_name=$variable_value"
	  	sed -i "/export $variable_name=\b/c\export $variable_name=$variable_value" /home/ec2-user/.bash_profile
	else
	  	echo env variable was not exported, but now it is
   		echo "export $variable_name=$variable_value" >> /home/ec2-user/.bash_profile
		source /home/ec2-user/.bash_profile 		
	fi
}

# ---------------------
# GET CONTENTS FROM AWS Parameter Store
# ---------------------
PS_REGION=ap-southeast-1

PS_NODE_ENV=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.NODE_ENV --with-decryption --query Parameters[0].Value)
PS_VT_REDIS_HOST=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.redis.host --with-decryption --query Parameters[0].Value)
PS_VT_REDIS_PORT=$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.redis.port --with-decryption --query Parameters[0].Value)

# ---------------------
# SET VARIABLES
# ---------------------

source ~/.bash_profile #REFRESH 

set_environment_variable_to_bash_profile "APPLICATION_DIRECTORY" "~/node-application/video-recording-with-webrtc/"
set_environment_variable_to_bash_profile "NODE_ENV" "Devle"
set_environment_variable_to_bash_profile "VT_REDIS_HOST" "$(aws ssm get-parameters --region $PS_REGION --names video-interview-poc.dev.redis.host --with-decryption --query Parameters[0].Value)"
set_environment_variable_to_bash_profile "VT_REDIS_PORT" "$PS_VT_REDIS_PORT"

source ~/.bash_profile #REFRESH 