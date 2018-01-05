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

source /home/ec2-user/.bash_profile #REFRESH 

# ---------------------
# SET VARIABLES
# ---------------------

set_environment_variable_to_bash_profile "APPLICATION_DIRECTORY" "/home/ec2-user/node-application/video-recording-with-webrtc/"
set_environment_variable_to_bash_profile "NODE_ENV" "$DEPLOYMENT_GROUP_NAME"
set_environment_variable_to_bash_profile "VT_REDIS_HOST" "video-i-poc-dev.zuvakz.0001.apse1.cache.amazonaws.com"
set_environment_variable_to_bash_profile "VT_REDIS_PORT" "6379"

source /home/ec2-user/.bash_profile #REFRESH 

