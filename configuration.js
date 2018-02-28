//set base directory global
global.__basedir = __dirname;

/***************************************
    GET VIA ENVIRONMENT VARIABLES
****************************************/

//AWS
const AWS_ACCESS_KEY = process.env.VT_AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.VT_AWS_SECRET_ACCESS_KEY;

//VIDEO TRANSCODING
const VIDEO_TRANSCODING_PIPELINE_ID = process.env.VT_PIPELINE_ID; 

//CLOUDFRONT
const VIDEO_TRANSCODING_CLOUDFRONT_URL = process.env.VT_CLOUDFRONT_URL; 
const VIDEO_TRANSCODING_CLOUDFRONT_FOR_SIGNED_COOKIES = process.env.VT_CLOUDFRONT_FOR_SIGNED_COOKIES;
const VIDEO_CF_PUBLIC_KEY = process.env.VT_CF_PUBLIC_KEY;
const VIDEO_CF_PRIVATE_KEY = process.env.VT_CF_PRIVATE_KEY;

//INPUT
const VIDEO_TRANSCODING_INPUT_BUCKET = process.env.VT_INPUT_BUCKET;
const VIDEO_TRANSCODING_INPUT_BUCKET_REGION = process.env.VT_INPUT_BUCKET_REGION; 
const VIDEO_TRANSCODING_INPUT_PREFIX = process.env.VT_INPUT_PREFIX || 'recorded_videos/';

//OUTPUT
const VIDEO_TRANSCODING_OUTPUT_PREFIX = process.env.VT_OUTPUT_PREFIX || 'transcoded_videos/';

//REDIS
const REDIS_HOST = process.env.VT_REDIS_HOST || 'redis';
const REDIS_PORT = process.env.VT_REDIS_PORT || 6379;

//SETUP CONFIGURATION

const CONFIGURATION = {
    http_port: process.env.HTTP_PORT || 8081, 
    https_port: process.env.HTTPS_PORT || 8444,
    jwt_secret_key: process.env.JWT_SECRET_KEY || 'ABCD123', 
    jwt_expiration_in_seconds : (60 * 60) * 24, //24 hrs
    db: {
        host: process.env.VT_DB_HOST, 
        username: process.env.VT_DB_USERNAME, 
        password: process.env.VT_DB_PASSWORD, 
        name: process.env.VT_DB_NAME, 
        port: process.env.VT_DB_PORT || 3306,
    },
    redis: {
        host: REDIS_HOST, 
        port: REDIS_PORT
    },
    video_transcoding: {
        temporary_video_location : __basedir + '/tmp_recorded_videos/',
        aws: {
            access_key: AWS_ACCESS_KEY,
            secret_access_key: AWS_SECRET_KEY, 
            region: VIDEO_TRANSCODING_INPUT_BUCKET_REGION,
            pipeline_id: VIDEO_TRANSCODING_PIPELINE_ID, 
            cloudfront: {
                url: VIDEO_TRANSCODING_CLOUDFRONT_URL, 
                url_for_signed_cookies : VIDEO_TRANSCODING_CLOUDFRONT_FOR_SIGNED_COOKIES,
                keypair_id : VIDEO_CF_PUBLIC_KEY,
                private_key_string : VIDEO_CF_PRIVATE_KEY
            },
            input_bucket: { //where videos to transcode are located
                bucket_name: VIDEO_TRANSCODING_INPUT_BUCKET, 
                prefix: VIDEO_TRANSCODING_INPUT_PREFIX
            }, 
            transcode_job_as_mpeg_dash: {
                prefix: VIDEO_TRANSCODING_OUTPUT_PREFIX,
                outputs: {
                    video: {
                        key: 'video.mp4',
                        preset_id: '1351620000001-500050', //mpeg-dash video 600k
                        thumbnail_pattern: 'thumbnail-{count}', 
                        thumbnail_name_on_transcode: 'thumbnail-00001.png',
                        segment_duration: "30",
                        rotate: 'auto' 
                    }, 
                    audio: {
                        key: 'audio.mp3',
                        preset_id: '1351620000001-500060', 
                        segment_duration: "30"
                    }
                }, 
                playlist: {
                    format: 'MPEG-DASH', 
                    name: 'video', 
                    name_on_transcode: 'video.mpd'
                }
            }
        }
    }
};

module.exports = CONFIGURATION;