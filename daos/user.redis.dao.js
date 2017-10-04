var redis = require('./../providers/redis');

exports.authenticate = authenticate;

/////

clearRedisAndInitializeUsers();

function clearRedisAndInitializeUsers(){

    //clear all
    console.log('cleared all redis content and initialized users');
    redis
        .client
        .flushallAsync()
        .then(
            () => {
                /* Save Demo Users */
                redis.client.set('user1', 'p');    
                redis.client.set('user2', 'p');
            }
        )
}


/**
 * 
 * @param {*} username 
 * @param {*} password 
 */
function authenticate(username, password){
    return new Promise((resolve, reject) => {
        redis
            .client
            .getAsync(username)
            .then(
                username_password => {
                    if ( username_password == password ){
                        return resolve({
                            id : 'user-id-' + username,
                            username : username
                        });
                    }
                    return reject('Invalid username or password');
                }, 
                reject
            )
    });
}