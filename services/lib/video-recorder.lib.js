var fs = require('fs'), 
aws = require('aws-sdk');

var config  = require('../../configuration');

/**
*Update aws configs
*/
aws.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
});    



/**
 * * Content of 'data' parameter object
 *  * temporary_file_location 
 *      * Where file will be temporary stored
 *  * filename 
 *      * Filename for created file
 * 
 * NOTE : public functions where made as 
 * promises, for future adjustments
 * 
 * @param {*} data 
 */
function VideoRecorder(data){
    
    //private use
    var private = {
        file_name : data.filename, 
        file_location : data.temporary_file_location, 
        file_fullpath : data.temporary_file_location + data.filename,
        file_write_stream : null
    };

    //will be available on public
    var public = {
        file_name : data.filename, 
        file_location : private.file_location, 
        file_fullpath : private.file_fullpath,
        getStream : getStream, 
        addStreamEvent : addStreamEvent,
        addVideoChunk : addVideoChunk, 
        stopRecording : stopRecording, 
        deleteRecordedFile : deleteRecordedFile,
        uploadRecordedFileToS3 : uploadRecordedFileToS3,
        fileExists : fileExists
    };

    initialize(); //run

    return public;

    ///

    /**
     * Do initial stuff, like create directory & 
     * initialize stream
     */
    function initialize(){
        //create folder if does not exists
        if ( !fs.existsSync(private.file_location) ){
            fs.mkdirSync(private.file_location);
        }

        //initialize stream
        private.file_write_stream = fs.createWriteStream(private.file_fullpath);
       
    }

    /**
     * 
     */
    function getStream(){
        return new Promise((resolve, reject) => {
            return resolve(private.file_write_stream);
        });            
    }

    /**
     * 
     */
    function addStreamEvent(event_name, callback){
        return new Promise((resolve, reject) => {
            private.file_write_stream.on(event_name, callback);
            return resolve(true);
        });            
    }

    /**
     * 
     * @param {*} chunk 
     */
    function addVideoChunk(chunk){
        return new Promise((resolve, reject) => {
            private.file_write_stream.write(chunk);
            resolve(chunk); //just return chunk
        });            
    }

    /**
     * 
     */
    function stopRecording(){
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                if ( private.file_write_stream ){ //validate if exists
                    private.file_write_stream.end();
                    private.file_write_stream = null;
                }
                return resolve(); //end when cleanup is done
            }, 1000);   
        });
    }

    /**
     * 
     */
    function deleteRecordedFile(){
        return new Promise((resolve, reject) => {
            public
                .fileExists()
                .then(
                    (exists) => {
                        if ( !exists ){
                            return resolve(true) //no need to delete, does not exists
                        }

                        //delete
                        fs.unlink(private.file_fullpath, (err) => {
                            if ( err ){
                                return reject(err);
                            }
                            return resolve();
                       });
                    }
                );
        });        
    }

    /**
     * 
     */
    function fileExists(){
        return new Promise((resolve, reject) => {
            fs.stat(private.file_fullpath, (err, stat) => {
                return resolve(!err);
            })   
        });            
    }

    /**
     * 
     */
    function uploadRecordedFileToS3(){
        return new Promise((resolve, reject) => {

            //create read stream
            var file_read_stream = fs.createReadStream(private.file_fullpath);
            
            var s3 = new aws.S3();            
            var params = {
                Bucket: 'sandbox-interview-storage', 
                Key: private.file_name, 
                Body: file_read_stream
            };
    
            s3.upload(params, function(err, data) {
                console.log('s3 upload', err, data);
                file_read_stream.close();
                file_read_stream = null;
                if ( err ){
                    return reject(err);
                }
                return resolve();  
            });

        });
    }

}


module.exports = VideoRecorder;