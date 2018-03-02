var jwt = require('jsonwebtoken');
var config = require('./../configuration'), 
    promiser = require('./../utils/promise.util').promiser;

////

var video_interview_user_redis_dao = require('./../daos/video-interview-user.redis.dao');

////

module.exports.authenticate = authenticate;
module.exports.decodeAuthToken = decodeAuthToken;
module.exports.signup = signup;
module.exports.isUsernameUsed = isUsernameUsed;
module.exports.getAllUsersUsername = getAllUsersUsername;

////

/**
 * 
 * @param {*} username 
 * @param {*} password 
 */
function authenticate(username, password){
    
    if ( !username || !password){
        return Promise.reject('Invalid Username or Password');
    }

    return new Promise((resolve, reject) => {
        return Promise
            .resolve() //start
                .then(() => video_interview_user_redis_dao.getUser(username)) //get user info by username
                .then(user_info => {
                    if ( !user_info || user_info.password !== password){
                        return Promise.reject('Invalid Username or Password');
                    }

                    //remove password
                    delete user_info.password;

                    //create token
                    return jwt.sign(user_info, config.jwt_secret_key, { expiresIn : config.jwt_expiration_in_seconds});
                })
            .then(resolve)
            .catch(reject);
    });
}

/**
 * 
 * @param {*} username 
 * @param {*} password 
 */
function signup(username, password){
    
    //validation
    if ( !username ){
        return Promise.reject('username is required');
    }

    if ( !password ){
        return Promise.reject('password is required');
    }

    return new Promise((resolve, reject) => {
        return Promise
            .resolve() //start
                .then(() => video_interview_user_redis_dao.isUsernameAlreadyUsed(username)) //get user info by username
                .then(is_already_used => {
                    if ( is_already_used ){ //already used
                        return Promise.reject('User already exists');
                    }
                    return video_interview_user_redis_dao.createUser(username, password);
                })
            .then(resolve)
            .catch(reject);
    });
}

/**
 * 
 * @param {*} username 
 */
function isUsernameUsed(username){
    return video_interview_user_redis_dao
        .isUsernameAlreadyUsed(username);
}

/**
 * 
 */
function getAllUsersUsername(){
    return video_interview_user_redis_dao.getAllUsersUsername();
}

/**
 * 
 * @param {*} auth_token 
 */
function decodeAuthToken(auth_token){
    if ( !auth_token || typeof auth_token != 'string' ){
        return Promise.reject('auth token is required and must be a string');
    }

    return new Promise((resolve, reject) => {
        jwt.verify(auth_token, config.jwt_secret_key, promiser(resolve, reject));
    });    
}