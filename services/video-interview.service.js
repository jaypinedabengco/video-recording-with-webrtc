var fs = require('fs'), 
    cfsign = require('aws-cloudfront-sign');
var config = require('./../configuration'), 
    cloudfront_config = require('./../configuration').video_transcoding.aws.cloudfront;
var VideoRecorder = require('./lib/video-recorder.lib');
var recorded_video_dao = require('./../daos/recorded_video.redis.dao');


////

exports.createVideoRecorder = createVideoRecorder;
exports.stopRecording = stopRecording;
exports.getAllRecordedVideos = getAllRecordedVideos;
exports.getAllVideoNames = getAllVideoNames;
exports.getVideoStreamFromLocalFile = getVideoStreamFromLocalFile;
exports.createCloudFrontSignedCookies = createCloudFrontSignedCookies;

////

/**
 * 
 */
function createVideoRecorder(){

    return new Promise((resolve, reject) => {

        var video_recorder = new VideoRecorder({
            filename : 'recorded-video.webm', 
            temporary_file_location : config.video_transcoding.temporary_video_location
        });

        //add event handlers here        
        video_recorder.addStreamEvent('error', function(err){
            console.log('error', err);
        });

        //send video recorder
        return resolve(video_recorder);

    });

}

/**
 * 
 */
function stopRecording(video_recorder){

    return new Promise((resolve, reject) => {

        if ( !video_recorder ){ //if empty, then no need to stop
            return resolve(true);
        }

        //validate if video recorder instance
        if ( !video_recorder.stopRecording ){
            return reject('Invalid parameter, should be instance of VideoRecorder');
        }

        if ( video_recorder.is_video_processing_in_progress ){
            return reject('video already being processed');
        }

        //to prevent triggering video processing 
        video_recorder.is_video_processing_in_progress = true;

        //disable video processing
        // return Promise.all([
        //     video_recorder.stopRecording() //close stream
        //     // video_recorder.deleteRecordedFile() //delete recorded file
        // ]).then(resolve, reject);

        //upload recorded video to s3
        video_recorder
            .uploadRecordedFileToS3()
            .then(
                Promise.all([
                    video_recorder.stopRecording(), //close stream
                    video_recorder.deleteRecordedFile() //delete recorded file
                ])
            )
            .then(()=> {
               return video_recorder
                    .transcodeUploadedFileOnS3ToMPEGDash()
                    .then((transcode_info) => {
                        //save transcoded content on DB or something..

                        //save 
                        return recorded_video_dao
                                .addRecordedVideo(transcode_info.id, transcode_info)
                                .then(
                                    recorded_video_dao.addRecordedVideoId(transcode_info.id) //save id to list
                                );
                    });
            })
            .then(resolve, reject);
    });        
}

/**
 * 
 */
function getAllRecordedVideos(){

    return recorded_video_dao
            .getAllRecordedVideoIds() //get all ids
            .then(ids => Promise.all(ids.map(recorded_video_dao.getRecordedVideo))) //get all videos
            .then(recorded_videos => {
                //process recorded videos
                recorded_videos.forEach(recorded_video => {
                    //remove unnecessary content
                    delete recorded_video.audio_key;
                    delete recorded_video.video_key;

                    // append cloudfront url
                    recorded_video.thumbnail_key = [cloudfront_config.url, recorded_video.thumbnail_key].join('/');
                    recorded_video.playlist_key =  [cloudfront_config.url, recorded_video.playlist_key].join('/');

                    //get signed url
                    // recorded_video.thumbnail_key = _signCloudFrontUrl(recorded_video.thumbnail_key);
                    // recorded_video.playlist_key =  _signCloudFrontUrl(recorded_video.playlist_key);
                    
                });
                return Promise.resolve(recorded_videos);
            })
            .catch(err => {
                console.log(err)
                return err;
            });
}

/**
 * 
 */
function getAllVideoNames(){
    return new Promise( (resolve, reject) => {
        fs.readdir(config.video_transcoding.temporary_video_location, (err, files) => {
            if ( err ) {
                return reject(err);
            }
            return resolve(files);
        });
    });
}

/**
 * 
 * @param {*} video_name 
 * @param {*} request 
 */
function getVideoStreamFromLocalFile(video_name){

    return new Promise((resolve, reject) => {

        var file_path = config.video_transcoding.temporary_video_location + video_name;
        
        if ( !fs.existsSync ){
            return reject('file does not exist');
        }
        
        var stat = fs.statSync(file_path);
        var file_size = stat.size;
        
        const header_info = {
            'Content-Length': file_size,
            'Content-Type': 'video/webm',
        }

        return resolve({
            header : header_info, 
            stream : fs.createReadStream(file_path)
        });

    });
    
}

/**
 * 
 */
function createCloudFrontSignedCookies(){
    return new Promise((resolve, reject) => {
        // var hours = 5;
        // var expiration = new Date().getTime() + ( ( hours * 60 ) * 60 ) * 10000; //convert to milliseconds
        var options = {
            keypairId: cloudfront_config.keypair_id,
            privateKeyString: cloudfront_config.private_key_string,
            // expireTime: expiration
        }
        var signed_cookies = cfsign.getSignedCookies(cloudfront_config.url_for_signed_cookies + '/*', options);
        return resolve(signed_cookies);
    }).then().catch(err => {
        console.log(err);
    });        
    
}

/**
 * 
 * @param {*} key_name 
 */
function _signCloudFrontUrl(key_name){
    var cloudfront_url = cloudfront_config.url + '/' + key_name;
    var hours = 5;
    var expiration = new Date().getTime() + ( ( hours * 60 ) * 60 ) * 1000; //convert to milliseconds
    var options = {
        keypairId: cloudfront_config.keypair_id,
        privateKeyString: cloudfront_config.private_key_string,
        expireTime: expiration
    }
    
    // Generating a signed URL
    var signed_url = cfsign.getSignedUrl(cloudfront_url, options);
    return signed_url; 
}
