var fs = require('fs');

var VideoRecorder = require('./lib/video-recorder.lib');

const RECORDED_VIDEOS_LOCATION = __basedir + '/tmp_recorded_videos/';

////

exports.RECORDED_VIDEOS_LOCATION = RECORDED_VIDEOS_LOCATION;
exports.createVideoRecorder = createVideoRecorder;
exports.stopRecording = stopRecording;
exports.getAllVideoNames = getAllVideoNames;
exports.getVideoStreamFromLocalFile = getVideoStreamFromLocalFile;
exports.getVideoStreamFromS3 = getVideoStreamFromS3;


////

/**
 * 
 */
function createVideoRecorder(){

    return new Promise((resolve, reject) => {

        var random_filename = 'recorded-video-' + (Math.random() * 10000) + '-' + new Date().getTime() + '-rvi.webm';

        var video_recorder = new VideoRecorder({
            filename : random_filename, 
            temporary_file_location : RECORDED_VIDEOS_LOCATION
        });

        //add event handlers here        
        video_recorder.addStreamEvent('error', function(err){
            console.log('error', err);
        });

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
        // video_recorder
        //     .stopRecording()
        //     .then(
        //         video_recorder.deleteRecordedFile()
        //     ).then(()=> {

        //         return video_recorder
        //             .getStream()
        //             .then((stream)=>{
        //                 console.log('stream', stream);
        //                 return stream;
        //             });

        //     }, reject);
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

/**
 * 
 * @param {*} video_name 
 */
function getVideoStreamFromS3(video_name){

}
