var fs = require('fs');

var VideoRecorder = require('./lib/video-recorder.lib');

const RECORDED_VIDEOS_LOCATION = __basedir + '/tmp_recorded_videos/', 
      S3_BUCKET_DESTINATION = 'sandbox-interview-storage';

////

exports.createVideoRecorder = createVideoRecorder;
exports.stopRecording = stopRecording;
exports.getAllVideoNames = getAllVideoNames;
exports.getVideoStreamFromLocalFile = getVideoStreamFromLocalFile;

////

/**
 * 
 */
function createVideoRecorder(){

    return new Promise((resolve, reject) => {

        var video_recorder = new VideoRecorder({
            filename : 'recorded-video.webm', 
            temporary_file_location : RECORDED_VIDEOS_LOCATION, 
            s3_bucket_destination : S3_BUCKET_DESTINATION
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

        //upload recorded video to s3
        video_recorder
            .uploadRecordedFileToS3()
            .then(
                Promise.all([
                    video_recorder.stopRecording(), //close stream
                    video_recorder.deleteRecordedFile() //delete recorded file
                ])
            )
            .then(resolve, reject);
    });        
}

/**
 * 
 */
function getAllVideoNames(){
    return new Promise( (resolve, reject) => {
        fs.readdir(RECORDED_VIDEOS_LOCATION, (err, files) => {
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

        var file_path = RECORDED_VIDEOS_LOCATION + video_name;
        
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
