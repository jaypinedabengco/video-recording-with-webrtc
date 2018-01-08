#!/bin/bash

# set_environment_variable_to_bash_profile(){
# 	local variable_name=$1
# 	local variable_value=$2

# 	if env | grep -q ^"$variable_name"=
# 	then
# 		local old_variable_content=${!variable_name}
# 	  	echo "export $variable_name=$old_variable_content"
# 	  	echo "export $variable_name=$variable_value"
# 	  	sed -i "/export $variable_name=\b/c\export $variable_name=$variable_value" /home/ec2-user/.bash_profile
# 	else
# 	  	echo env variable was not exported, but now it is
#    		echo "export $variable_name=$variable_value" >> /home/ec2-user/.bash_profile
# 		source /home/ec2-user/.bash_profile
# 	fi
# }

# GP_VT_REDIS_HOST=$(aws ssm get-parameters --region ap-southeast-1 --names video-interview-poc.dev.redis.host --with-decryption --query Parameters[0].Value) &&
# set_environment_variable_to_bash_profile "xVT_REDIS_HOST" $GP_VT_REDIS_HOST


. ~/.bash_profile
source ~/.bash_profile

#Start PM2
cd ~/node-application/video-recording-with-webrtc/
npm run pm2_stop
npm run pm2_start