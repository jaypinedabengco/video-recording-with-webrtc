var util = require('util');
var redis = require('./../providers/redis');

const RECORDED_VIDEO = 'recorded-video:video:%s';
const RECORDED_VIDEOS_IDS = 'recorded-videos:id-list';

///

exports.addRecordedVideoId = addRecordedVideoId;
exports.getAllRecordedVideoIds = getAllRecordedVideoIds;
exports.addRecordedVideo = addRecordedVideo;
exports.getRecordedVideo = getRecordedVideo;

///

/**
 * 
 * @param {*} key 
 */
function addRecordedVideoId(video_id){
    return redis
            .client
            .zaddAsync(RECORDED_VIDEOS_IDS, [Date.now(), video_id]);
}

/**
 * 
 * @param {*} newest_first 
 */
function getAllRecordedVideoIds(newest_first){

    if ( newest_first ){
        return redis
                .client
                .zrevrangebyscoreAsync(RECORDED_VIDEOS_IDS, '+inf', '-inf');//get all +inf = infinity
    } else {
        return redis
                .client
                .zrangebyscoreAsync(RECORDED_VIDEOS_IDS, '-inf', '+inf');
    }

}

/**
 * 
 */
function addRecordedVideo(recorded_video_id, recorded_video_model){
    return redis
            .client.hmsetAsync(
                util.format(RECORDED_VIDEO, recorded_video_id ), //build room name
                recorded_video_model
            );
}

/**
 * 
 * @param {*} recorded_video_id 
 */
function getRecordedVideo(recorded_video_id){
    return redis
        .client.hgetallAsync(
            util.format(RECORDED_VIDEO, recorded_video_id)
        );
}
