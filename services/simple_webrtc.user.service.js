var _u = require('underscore');
var users = [];

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
    return new Promise((resolve, reject) => {
        if ( !users[username] ){
            return reject('User not found');
        }
        return resolve(users[username]);
    });
}

/**
 * 
 * @param {*} username 
 * @param {*} socket_id 
 */
function setUser(username, socket_id){
    return new Promise((resolve, reject) => {
        if ( users[username] ){
            return reject('User already exists');
        }
        users[username] = {
            username : username, 
            socket_id : socket_id
        };
        return resolve("successfully set socket id");
    });    
}

/**
 * 
 * @param {*} username 
 */
function deleteUser(username){
    return new Promise((resolve, reject) => {
        if ( users[username] ){
            delete users[username];
        }
        return resolve("successfully deleted socket id");
    });        
}

/**
 * 
 * @param {*} logged_username 
 */
function getAllUsernames(logged_username){
    return new Promise((resolve, reject) => {
        return resolve( _u.keys(users));
    });            
    
}