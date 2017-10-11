var fs = require('fs'), 
    aws = require('aws-sdk'), 
    uuidv4 = require('uuid/v4');

var config  = require('../../configuration').video_transcoding;

//preset id lists : http://docs.aws.amazon.com/elastictranscoder/latest/developerguide/system-presets.html

// CREATE pipeline on AWS Console ( Due to pipeline limit per aws account )
// const PIPELINE_CONFIG = {
//     name : 'Video Interview Transcoder (Development)', 
//     role : 'arn:aws:iam::028813482537:role/Elastic_Transcoder_Default_Role', 
//     output_bucket : 'sandbox-interview-storage', 
//     content_config : {
//         bucket: 'sandbox-interview-storage',
//         storage_class : 'Standard', 
//         permissions: []        
//     },
//     thumbnail_config : {
//         bucket : 'sandbox-interview-storage', 
//         storage_class : 'Standard', 
//         permissions: []
//     }
// }
// const TRANSCODING_JOB_CONFIG = {
//     PipelineId: PIPELINE_ID, 
// }

/** Update aws configs */
aws.config.update({
    accessKeyId: config.aws.access_key,
    secretAccessKey: config.aws.secret_access_key,
    region : config.aws.region
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
    
    var random_s3_prefix = uuidv4() + (new Date().getTime()) + '/';  //build keyname ( along with directory )  
    var random_file_name = [uuidv4(), (new Date().getTime()), data.filename].join('-');

    //internal use
    var private = {
        file_name : random_file_name, 
        file_location : data.temporary_file_location, 
        file_fullpath : data.temporary_file_location + random_file_name,
        file_write_stream : null, 
        file_s3_bucket_destination : config.aws.input_bucket.bucket_name,        
        file_s3_random_prefix : random_s3_prefix,
        file_s3_file_fullpath : config.aws.input_bucket.prefix + random_s3_prefix + random_file_name, //full path on s3
    };

    //will be available on public
    var public = {
        file_name : private.file_name, 
        file_location : private.file_location, 
        file_fullpath : private.file_fullpath,
        getStream : getStream, 
        addStreamEvent : addStreamEvent,
        addVideoChunk : addVideoChunk, 
        stopRecording : stopRecording, 
        deleteRecordedFile : deleteRecordedFile,
        uploadRecordedFileToS3 : uploadRecordedFileToS3,
        transcodeUploadedFileOnS3ToMPEGDash : transcodeUploadedFileOnS3ToMPEGDash,
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
            console.log('BUILDING VIDEO ', private.file_name);            
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
            console.log('UPLOADING VIDEO TO S3', private.file_s3_file_fullpath);
            //create read stream
            var file_read_stream = fs.createReadStream(private.file_fullpath);
            
            var s3 = new aws.S3();            
            var params = {
                Bucket: private.file_s3_bucket_destination, 
                Key: private.file_s3_file_fullpath,
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
                    Bucket : params.Bucket, 
                    Key : params.Body
                });  
            });
        });
    }

    /**
     * 
     */
    function transcodeUploadedFileOnS3ToMPEGDash(){
        return new Promise((resolve, reject) => {
            console.log('TRANSCODING VIDEO ', private.file_s3_file_fullpath);;

            const JOB_CONFIG = config.aws.transcode_job_as_mpeg_dash;

            const TRANSCODED_FILE_PREFIX = JOB_CONFIG.prefix + private.file_s3_random_prefix;

            //create UNIQUE key names
            const OUTPUT_VIDEO_KEY = [uuidv4(), JOB_CONFIG.outputs.video.key].join('-');
            const OUTPUT_AUDIO_KEY = [uuidv4(), JOB_CONFIG.outputs.audio.key].join('-');
            const PLAYLIST_NAME = [uuidv4(), JOB_CONFIG.playlist.name].join('-');
            const PLAYLIST_NAME_ON_TRANSCODE = [uuidv4(), JOB_CONFIG.playlist.name_on_transcode].join('-');

            var transcode_job = {
                PipelineId: config.aws.pipeline_id, /* required */
                Input: {
                  Key: private.file_s3_file_fullpath // get uploaded file
                },
                OutputKeyPrefix : TRANSCODED_FILE_PREFIX,
                Outputs: [
                  { //video
                    Key: OUTPUT_VIDEO_KEY, 
                    PresetId: JOB_CONFIG.outputs.video.preset_id, //mpeg-dash video 600k
                    SegmentDuration: JOB_CONFIG.outputs.video.segment_duration, 
                    ThumbnailPattern: JOB_CONFIG.outputs.video.thumbnail_pattern, 
                    Rotate: JOB_CONFIG.outputs.video.rotate
                  },
                  { //audio
                    Key: OUTPUT_AUDIO_KEY,
                    PresetId: JOB_CONFIG.outputs.audio.preset_id, //mpeg-dash audio 128k
                    SegmentDuration: JOB_CONFIG.outputs.audio.segment_duration 
                  }     
                ],
                Playlists: [
                  {
                    Name: PLAYLIST_NAME,
                    Format: JOB_CONFIG.playlist.format,
                    OutputKeys: [
                        OUTPUT_VIDEO_KEY,
                        OUTPUT_AUDIO_KEY,
                    ]
                  }
                ]
              };  

              var elastictranscoder = new aws.ElasticTranscoder();            
              elastictranscoder.createJob(transcode_job, (err, data) => {
                if ( err ){
                    return reject(err);
                }
                console.log(data);

                //return 'keys' on end of request
                return resolve({
                    video_key : TRANSCODED_FILE_PREFIX + JOB_CONFIG.outputs.video.key, 
                    audio_key : TRANSCODED_FILE_PREFIX + OUTPUT_AUDIO_KEY, 
                    thumbnail_key : TRANSCODED_FILE_PREFIX + JOB_CONFIG.outputs.video.thumbnail_name_on_transcode,
                    playlist_key : TRANSCODED_FILE_PREFIX + PLAYLIST_NAME_ON_TRANSCODE
                });
              });             
        });            
    }

    /**
     * 
     */
    // function getOrCreatePipelineId(){

    //     return getTranscodePipelineIdByName(PIPELINE_CONFIG.name)
    //         .then(
    //             (pipeline_id) => {

    //                 //already exists, just return the id
    //                 if ( pipeline_id ){
    //                     return Promise.resolve(pipeline_id);
    //                 }

    //                 return createPipeline(); //will return pipeline_id if successful
    //                 //create pipeline 
    //             }
    //         )
    // }

    /**
     * 
     */
    // function createPipeline(){
    //     return new Promise((resolve, reject) => {

    //         var elastictranscoder = new aws.ElasticTranscoder();            

    //         var params = {
    //             InputBucket : RECORDED_VIDEOS_S3_DESTINATION, 
    //             Name : PIPELINE_CONFIG.name, 
    //             Role : PIPELINE_CONFIG.role, 
    //             ContentConfig : {
    //                 Bucket : PIPELINE_CONFIG.content_config.bucket, 
    //                 Permissions : PIPELINE_CONFIG.content_config.permissions,
    //                 StorageClass : PIPELINE_CONFIG.content_config.storage_class
    //             }, 
    //             OutputBucket : PIPELINE_CONFIG.output_bucket, 
    //             ThumbnailConfig : {
    //                 Bucket: PIPELINE_CONFIG.thumbnail_config.bucket, 
    //                 Permissions: PIPELINE_CONFIG.thumbnail_config.permissions, 
    //                 StorageClass: PIPELINE_CONFIG.thumbnail_config.storage_class
    //             }
    //         }

    //         elastictranscoder.createPipeline(params, (err, data) => {
    //             if ( err ){
    //                 return reject(err);
    //             }
    //             return resolve(data.Pipeline.Id); //return id
    //           });                          

    //     });            
    // }

    // /**
    //  * 
    //  * @param {*} pipeline_name 
    //  */
    // function getTranscodePipelineIdByName(pipeline_name){
    //     return new Promise((resolve, reject) => {
            
    //         var elastictranscoder = new aws.ElasticTranscoder();
            
    //         var params = {
    //             Ascending: 'false', //reverse
    //         };
              
    //         elastictranscoder.listPipelines(params, (err, data) => {
    //             if (err) {
    //                 return reject(err);
    //             } else {
    //                 var pipelines = data.Pipelines ? data.Pipelines : [];

    //                 var pipeline_id = null;
    //                 pipelines.forEach(pipeline => {
    //                     if ( pipeline.Name == pipeline_name )
    //                         pipeline_id = pipeline.Id;
    //                 });
    //                 return resolve(pipeline_id);
    //             }     
    //         });
    //     });
    // }
}


module.exports = VideoRecorder;