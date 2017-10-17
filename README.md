# video-recording-with-webrtc
Sample Video Recording using WebRTC
 - will also use AWS Video Transcoding for video processing


## INSTALL
  * nodeJS
  * bower
  * nodemon
  * docker
  * chrome
  
## SETUP 

  * SET the following on your environment variable 
    * VT_AWS_ACCESS_KEY_ID
    * VT_AWS_SECRET_ACCESS_KEY
    * VT_PIPELINE_ID
    * VT_CLOUDFRONT_URL
    * VT_INPUT_BUCKET
    * VT_INPUT_BUCKET_REGION
    * VT_INPUT_PREFIX
    * VT_OUTPUT_PREFIX
    * VT_REDIS_HOST=127.0.0.1 #default value, change if changed on docker
    * VT_REDIS_PORT=16379 #default value, change if changed on docker
  * RUN docker on redis
    * docker run --name packt-redis -p 16379:6379 -d redis:3.2.4
  * INSTALL npm and bower modules
    * npm install
    * bower install

## RUN
 * npm run dev
   * this is to run via nodemon
   

