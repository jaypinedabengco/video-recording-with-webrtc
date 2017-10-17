############################################
##ADD THE FOLLOWING ON SERVER ENV####
############################################

#VT_AWS_ACCESS_KEY_ID
#VT_AWS_SECRET_ACCESS_KEY
#VT_PIPELINE_ID
#VT_CLOUDFRONT_URL
#VT_CLOUDFRONT_FOR_SIGNED_COOKIES
#VT_INPUT_BUCKET
#VT_INPUT_BUCKET_REGION
#VT_INPUT_PREFIX
#VT_OUTPUT_PREFIX
#VT_CF_PUBLIC_KEY
#VT_CF_PRIVATE_KEY

#######

FROM node:6.11.2

# Install Bower
RUN npm install -g bower

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Install bower dependencies
COPY bower.json /usr/src/app/
COPY .bowerrc /usr/src/app/
RUN bower install

# Bundle app source
COPY . /usr/src/app

# SET ENVIRONMENT VARIABLES
# TRYING TO FIGURE OUT HOW TO USE THIS

EXPOSE 8443

CMD [ "npm", "start" ]

