var express = require('express'), 
    jwt = require('jsonwebtoken');

var config = require('./../configuration');
var router = express.Router();

var response_helper = require('./helper/response.helper');

var video_interview_user_service = require('./../services/video-interview.user.service');

//////

router.post('/authenticate', authenticate);
router.post('/validate-token', validateToken);

/////

/**
 * Simulate Authentication
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function authenticate(req, res, next){
    var auth_info = req.body;

    return video_interview_user_service
            .authenticate(auth_info.username, auth_info.password)
        .then(token => response_helper.success('signin successful', token, res))
        .catch(err => response_helper.fail(403, 'login failed', err, res, next));
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function validateToken(req, res, next){
    var auth_token = req.body;

    return video_interview_user_service
            .decodeAuthToken(auth_token)
        .then(data => response_helper.success('token is valid', auth_token, res))
        .catch(err => response_helper.fail(403, 'token is not valid', err, res, next));   
}

module.exports = router;