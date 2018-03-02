var express = require('express'), 
    jwt = require('jsonwebtoken');

var config = require('./../configuration');
var router = express.Router();

var response_helper = require('./helper/response.helper');

var video_interview_user_service = require('./../services/video-interview.user.service');

//////

router.post('/authenticate', authenticate);
router.post('/validate-token', validateToken);
router.post('/get-logged-user-info', getLoggedUserInfo);

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
    return response_helper.success('token is valid', '', res);
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getLoggedUserInfo(req, res, next){
    if ( !req.logged_user ){
        response_helper.fail(403, 'not logged in', 'not logged in', res, next);
    }
    return response_helper.success('logged user info', req.logged_user, res);
}

module.exports = router;