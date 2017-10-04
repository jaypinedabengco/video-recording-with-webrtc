var util = require('util');
var redis = require('./../providers/redis');

///

const USER_INFO = 'chat:user:%s'; //socket_id
const ROOM_USER = 'chat:user-in-room:%s'; //socket_id

///

exports.addUserInformation = addUserInformation;
exports.removeUserInformation = removeUserInformation;
exports.getUserBySocketId = getUserBySocketId;
exports.registerRoomToUser = registerRoomToUser;
exports.unregisterRoomToUser = unregisterRoomToUser;
exports.getUsersRooms = getUsersRooms;

///


/**
 * 
 * @param {*} socket_id 
 * @param {*} user_info 
 */
function addUserInformation(socket_id, user_info){

    user_info.id = 'sample-id-' + Math.floor((Math.random() * 100000));
    return redis
            .client
            .hmsetAsync(
                util.format(USER_INFO, socket_id),
                user_info
            ).then(()=>{return user_info}); //return user info with socket id
}

/**
 * 
 * @param {*} socket_id 
 * @param {*} user_info 
 */
function removeUserInformation(socket_id, user_info){
    return redis
        .client
        .delAsync(util.format(USER_INFO, socket_id));
}

/**
 * 
 * @param {*} socket_id 
 */
function getUserBySocketId(socket_id){
    return redis
        .client
        .hgetallAsync(util.format(USER_INFO, socket_id));
}

/**
 * - model 
 *  - room_name (string)
 *  - socket_id (string)
 * 
 * @param {*} model 
 */
function registerRoomToUser(model){
    return redis
        .client
        .zaddAsync(
            util.format(ROOM_USER, model.socket_id), 
            [Date.now(), model.room_name]);
}

/**
 * 
 * @param {*} socket_id 
 */
function unregisterRoomToUser(socket_id){
    return redis
        .client
        .delAsync(util.format(ROOM_USER, socket_id));
}

/**
 * 
 * @param {*} socket_id 
 */
function getUsersRooms(socket_id){
    return redis
        .client
        .zrevrangebyscoreAsync(util.format(ROOM_USER, socket_id), '+inf', '-inf');//get all +inf = infinity
}

