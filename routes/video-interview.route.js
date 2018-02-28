var express = require('express');
var router = express.Router();

var video_interview_service = require('./../services/video-interview.service');

//////

router.get('/get-recorded-videos', getRecordedVideos);
router.get('/stream-video/:video_name', streamVideo);

//on live, this api should have authentication validator, it should not be public
router.get('/get-cf-signed-cookies', getSignedCookies); 

/////

function getRecordedVideos(req, res, next){
    video_interview_service
        .getAllRecordedVideos()
        .then(
            (result) => res.status(200).json({
                success : true, 
                data : result
            }),
            (err) => res.status(400).json({
                success : false, 
                data : err
            })
        );
}

/**
 * Video Streamer for local videos
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function streamVideo(req, res, next){
    var video_name = req.params.video_name;
    video_interview_service
        .getVideoStreamFromLocalFile(video_name)
        .then(
            (video_stream) => {
                res.writeHead(200, video_stream.header);                
                video_stream.stream.pipe(res); //pipe file to response
            }, 
            (err) => res.status(500).json(err)
        );
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getSignedCookies(req, res, next){
    video_interview_service
        .createCloudFrontSignedCookies()
        .then(
            (result) => res.status(200).json({
                success : true, 
                data : result
            }),
            (err) => res.status(400).json({
                success : false, 
                data : err
            })
        )
}

module.exports = router;