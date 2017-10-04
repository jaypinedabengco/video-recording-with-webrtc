var redis = require('./../providers/redis'), 
    util = require('util');

const USER_INFO = 'webrtc:user:%s'; //socket_id
const ALL_USERS = 'webrtc:usernames'; //socket_id

exports.addUser = addUser;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;

/////

/**
 * 
 * @param {*} username 
 * @param {*} password 
 */
function addUser(username, user_info){
    return Promise.all([
            redis.client.hmsetAsync(util.format(USER_INFO, username), user_info),  //add user
            redis.client.zaddAsync(ALL_USERS, [Date.now(), username])])  //add to users on webrtc
        .then(() => user_info); //return userinfo
}

/**
 * 
 * @param {*} username 
 */
function getUser(username){
    return redis
        .client
        .hgetallAsync(util.format(USER_INFO, username));    
}

/**
 * 
 */
function getAllUsers(){
    return redis
        .client
        .zrevrangebyscoreAsync(ALL_USERS, '+inf', '-inf');//get all +inf = infinity
}

/**
 * 
 * @param {*} username 
 */
function deleteUser(username){
    return Promise.all([
        redis.client.delAsync(util.format(USER_INFO, username)), //delete user
        redis.client.zremAsync(ALL_USERS, username)]) //remove user on all users list
}