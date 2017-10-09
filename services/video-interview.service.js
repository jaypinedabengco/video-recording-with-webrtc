var fs = require('fs');

const RECORDED_VIDEOS_LOCATION = __basedir + '/tmp_recorded_videos/';

////

exports.RECORDED_VIDEOS_LOCATION = RECORDED_VIDEOS_LOCATION;
exports.getAllVideoNames = getAllVideoNames;
exports.getVideoStream = getVideoStream;


////

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
function getVideoStream(video_name){

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
