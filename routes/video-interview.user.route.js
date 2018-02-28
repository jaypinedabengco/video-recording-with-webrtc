var express = require('express'), 
    jwt = require('jsonwebtoken');

var config = require('./../configuration');
var router = express.Router();

var response_helper = require('./helper/response.helper');

var video_interview_user_service = require('./../services/video-interview.user.service');

//////

router.post('/signup', signupUser);
router.post('/is-username-used', isUsernameUsed);
router.post('/get-all-users-usernames', getAllUsersUsername);

/////

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function signupUser(req, res, next){
    var auth_info = req.body;

    return video_interview_user_service
            .signup(auth_info.username, auth_info.password)
        .then(token => response_helper.success('signup successful', token, res))
        .catch(err => response_helper.fail(400, 'signup failed', err, res, next));
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isUsernameUsed(req, res, next){
    var request_body = req.body;

    return video_interview_user_service
            .isUsernameUsed(request_body.username)
        .then(is_user_name_used => response_helper.success('', is_user_name_used, res))
        .catch(err => response_helper.fail(400, '', err, res, next));
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getAllUsersUsername(req, res, next){
    return video_interview_user_service
            .getAllUsersUsername()
        .then(usernames => response_helper.success('', usernames, res))
        .catch(err => response_helper.fail(500, '', err, res, next));
}

module.exports = router;