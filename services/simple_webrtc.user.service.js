var webrtc_user_dao = require('./../daos/simple_webrtc_users.redis.dao');

exports.getUser = getUser;
exports.setUser = setUser;
exports.deleteUser = deleteUser;
exports.getAllUsernames = getAllUsernames;

////

/**
 * 
 * @param {*} username 
 */
function getUser(username){
    return webrtc_user_dao.getUser(username);
}

/**
 * 
 * @param {*} username 
 * @param {*} socket_id 
 */
function setUser(username, user_info, socket_id){
    //add user info
    user_info.socket_id = socket_id;
    return webrtc_user_dao.addUser(username, user_info);
}

/**
 * 
 * @param {*} username 
 */
function deleteUser(username){
    return webrtc_user_dao.deleteUser(username);
}

/**
 * 
 * @param {*} logged_username 
 */
function getAllUsernames(logged_username){
    return webrtc_user_dao.getAllUsers();         
}