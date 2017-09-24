var util = require('util');
var redis = require('./../providers/redis');

///

const ROOM_NAME = 'chat:room:%s'; //room name
const ROOM_LIST_NAME = 'chat:rooms';
const ROOM_USER = 'chat:room:user:%s';//room_name

///

exports.createRoom = createRoom;
exports.getRoom = getRoom;
exports.addToRoomList = addToRoomList;
exports.removeRoomToList = removeRoomToList;
exports.getAllRooms = getAllRooms;
exports.removeToRoomList = removeToRoomList;
exports.addUserToRoom = addUserToRoom;
exports.getAllUsersInRoom = getAllUsersInRoom;
exports.removeUserToRoom = removeUserToRoom;

///

/**
 * - model 
 *  - room_name (string)
 *  - socket_id (string)
 * 
 * @param {*} model 
 */
function createRoom(model){
    
    return redis
            .client.hmsetAsync(
                util.format(ROOM_NAME, model.room_name ), //build room name
                {creator_socket_id : model.socket_id}
            );
}

/**
 * 
 * @param {*} room_name 
 */
function getRoom(room_name){
    return redis
        .client.hgetallAsync(
            util.format(ROOM_NAME,room_name)
        );
}

/**
 * 
 * @param {*} room_name 
 */
function addToRoomList(room_name){
    return redis
        .client
        .zaddAsync(ROOM_LIST_NAME, [Date.now(), room_name]);
}

/**
 * 
 * @param {*} room_name 
 */
function removeRoomToList(room_name){
    return redis
        .client
        .zremAsync(ROOM_LIST_NAME, room_name);
}

/**
 * 
 */
function getAllRooms(){
    return redis
        .client
        .zrevrangebyscoreAsync(ROOM_LIST_NAME, '+inf', '-inf');//get all +inf = infinity
}

/**
 * 
 * @param {*} room_name 
 */
function removeToRoomList(room_name){
    return redis
        .client
        .zrem(ROOM_LIST_NAME, room_name);
}

/**
 * - model 
 *  - room_name (string)
 *  - socket_id (string)
 * 
 * @param {*} model 
 */
function addUserToRoom(model){
    return redis
            .client
            .zaddAsync(
                util.format(ROOM_USER, model.room_name), 
                [Date.now(), model.socket_id]
            );
}

/**
 * 
 * @param {*} room_name 
 */
function getAllUsersInRoom(room_name){
    return redis
        .client
        .zrangebyscoreAsync(util.format(ROOM_USER, room_name), '-inf', '+inf');
}

/**
 * 
 * @param {*} model 
 */
function removeUserToRoom(room_name, socket_id){
    return redis
        .client
        .zremAsync(util.format(ROOM_USER, room_name), socket_id);
}


