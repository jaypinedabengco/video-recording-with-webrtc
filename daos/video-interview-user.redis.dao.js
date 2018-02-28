var util = require('util');
var redis = require('./../providers/redis');

const REDIS_KEYS = {
    user : 'video-interview:user:%s', //%s = username
    users: 'video-interview:users', // all users 
    logged_in : 'video-interview:logged-in:%s' //%s = username
};

//create initial users
_createInitialUsers();

//////

exports.createUser = createUser;
exports.getUser = getUser;
exports.isUsernameAlreadyUsed = isUsernameAlreadyUsed;
exports.getAllUsersUsername = getAllUsersUsername;

/////

function _createInitialUsers(){
     Promise.all([
        createUser('user1', 1),
        createUser('user2', 2)
     ])
     .then(result => {
         console.log(`
            INITIAL USERS CREATED : 
         `, result);
     })
     .catch(err => {
         console.log('error on create initial users', err);
     });
}

/**
 * 
 * @param {*} username 
 * @param {*} password 
 */
function createUser(username, password){
    let user_model = {
        id: `${new Date().getTime()}-${Math.floor((Math.random() * 100000))}`, //random-id
        username : username, 
        password : password, 
        date_created: new Date().getTime()
    };

    return redis.
        hmset(
            util.format(REDIS_KEYS.user, username),
            user_model
        )
        .then(() => redis.zadd(REDIS_KEYS.users, new Date().getTime(), username ) ) //add to users
        .then(() => {
            delete user_model.password;
            return user_model;
        }); 
}

/**
 * 
 * @param {*} username 
 */
function isUsernameAlreadyUsed(username){
    return redis.
            hgetall(util.format(REDIS_KEYS.user, username))
        .then(data => !!data); //return boolean
}

/**
 * 
 * @param {*} username 
 */
function getUser(username){
    return redis.hgetall(util.format(REDIS_KEYS.user, username));
}

/**
 * 
 */
function getAllUsersUsername(){
    return redis.zrangebyscore(REDIS_KEYS.users, '-inf', '+inf');
}