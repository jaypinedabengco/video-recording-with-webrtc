var jwt = require('jsonwebtoken');
var config = require('./../configuration');
var user_redis_dao = require('./../daos/user.redis.dao');

exports.authenticate = authenticate;
exports.verifyAndDecodeToken = verifyAndDecodeToken;

////

/**
 * 
 * @param {*} username 
 * @param {*} password 
 */
function authenticate(username, password){
    return user_redis_dao
        .authenticate(username, password);
}

/**
 * 
 * @param {*} auth_token 
 */
function verifyAndDecodeToken(auth_token){
    return new Promise((resolve, reject) => {
        jwt.verify(auth_token, config.jwt_secret_key, function(err, decoded) {      
            if (err) {
                return reject(err);
            } 
            return resolve(decoded);
          });
    });    
}