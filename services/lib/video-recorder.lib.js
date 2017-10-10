var fs = require('fs'), 
    aws = require('aws-sdk'), 
    uuidv4 = require('uuid/v4');

var config  = require('../../configuration');


const RECORDED_VIDEOS_S3_DESTINATION = 'sandbox-interview-storage';
const RECORDED_VIDEOS_S3_KEY_PREFIX = 'recorded_videos/';

const PIPELINE_CONFIG = {
    name : 'Video Interview Transcoder (Development)', 
    role : 'arn:aws:iam::028813482537:role/Elastic_Transcoder_Default_Role', 
    output_bucket : 'sandbox-interview-storage', 
    content_config : {
        bucket: 'sandbox-interview-storage',
        storage_class : 'Standard', 
        permissions: []        
    },
    thumbnail_config : {
        bucket : 'sandbox-interview-storage', 
        storage_class : 'Standard', 
        permissions: []
    }
}

/**
*Update aws configs
*/
aws.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region : 'ap-southeast-1' //Singapore
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
        file_write_stream : null, 
        file_s3_bucket_destination : RECORDED_VIDEOS_S3_DESTINATION,        
        file_s3_prefix : RECORDED_VIDEOS_S3_KEY_PREFIX,
        file_s3_created_key : '', //will be populated on uploadRecordedFileToS3         
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
        transcodeUploadedFileOnS3 : transcodeUploadedFileOnS3,
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

            //create s3 key for file
            private.file_s3_created_key = private.file_s3_prefix + uuidv4() + (new Date().getTime()) + '/' + private.file_name;

            //create read stream
            var file_read_stream = fs.createReadStream(private.file_fullpath);
            
            var s3 = new aws.S3();            
            var params = {
                Bucket: private.file_s3_bucket_destination, 
                Key: private.file_s3_created_key, 
                Body: file_read_stream
            };
    
            s3.upload(params, function(err, data) {
                console.log('s3 upload', err, data);

                //close first
                file_read_stream.close();
                file_read_stream = null;
                if ( err ){
                    return reject(err);
                }

                //return bucket where it was uploaded & key name
                return resolve({
                    Bucket : private.file_s3_bucket_destination, 
                    Key : private.file_s3_created_key
                });  
            });

        });
    }

    /**
     * 
     */
    function transcodeUploadedFileOnS3(){
        return new Promise((resolve, reject) => {

        });            
    }

    /**
     * 
     */
    function getOrCreatePipelineId(){

        return getTranscodePipelineIdByName(PIPELINE_CONFIG.name)
            .then(
                (pipeline_id) => {

                    //already exists, just return the id
                    if ( pipeline_id ){
                        return Promise.resolve(pipeline_id);
                    }

                    return createPipeline(); //will return pipeline_id if successful
                    //create pipeline 
                }
            )
    }

    /**
     * 
     */
    function createPipeline(){
        return new Promise((resolve, reject) => {

            var elastictranscoder = new aws.ElasticTranscoder();            

            var params = {
                InputBucket : RECORDED_VIDEOS_S3_DESTINATION, 
                Name : PIPELINE_CONFIG.name, 
                Role : PIPELINE_CONFIG.role, 
                ContentConfig : {
                    Bucket : PIPELINE_CONFIG.content_config.bucket, 
                    Permissions : PIPELINE_CONFIG.content_config.permissions,
                    StorageClass : PIPELINE_CONFIG.content_config.storage_class
                }, 
                OutputBucket : PIPELINE_CONFIG.output_bucket, 
                ThumbnailConfig : {
                    Bucket: PIPELINE_CONFIG.thumbnail_config.bucket, 
                    Permissions: PIPELINE_CONFIG.thumbnail_config.permissions, 
                    StorageClass: PIPELINE_CONFIG.thumbnail_config.storage_class
                }
            }

            elastictranscoder.createPipeline(params, (err, data) => {
                if ( err ){
                    return reject(err);
                }
                return resolve(data.Pipeline.Id); //return id
              });                          

        });            
    }

    /**
     * 
     * @param {*} pipeline_name 
     */
    function getTranscodePipelineIdByName(pipeline_name){
        return new Promise((resolve, reject) => {
            
            var elastictranscoder = new aws.ElasticTranscoder();
            
            var params = {
                Ascending: 'false', //reverse
            };
              
            elastictranscoder.listPipelines(params, (err, data) => {
                if (err) {
                    return reject(err);
                } else {
                    var pipelines = data.Pipelines ? data.Pipelines : [];

                    var pipeline_id = null;
                    pipelines.forEach(pipeline => {
                        if ( pipeline.Name == pipeline_name )
                            pipeline_id = pipeline.Id;
                    });
                    return resolve(pipeline_id);
                }     
            });
        });
    }
}


module.exports = VideoRecorder;