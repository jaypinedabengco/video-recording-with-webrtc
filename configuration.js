/*
Sample Configuration file
*/
const CONFIGURATION = {
    http_port: process.env.HTTP_PORT || 8081, 
    https_port: process.env.HTTPS_PORT || 8444,
    jwt_secret_key: process.env.JWT_SECRET_KEY || 'ABCD123', 
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1', 
        port: process.env.REDIS_PORT || 16379
    },
    video_transcoding: {
        aws: {
            access_key: process.env.AWS_ACCESS_KEY,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY, 
            region: 'ap-southeast-1',
            pipeline_id: '1507540873164-vqf5mt', 
            input_bucket: { //where videos to transcode are located
                bucket_name: 'sandbox-interview-storage', 
                prefix: 'recorded_videos/'
            }, 
            transcode_job_as_mpeg_dash: {
                prefix: 'transcoded_videos/',
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