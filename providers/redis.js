var redis = require('redis');
var bluebird = require('bluebird');
var config = require('./../configuration');

//promisify all
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = createClient();

////

module.exports.createClient = createClient;
module.exports.get = get;
module.exports.hgetall = hgetall;
module.exports.lrange = lrange;
module.exports.zrevrangebyscore = zrevrangebyscore; 
module.exports.client = client;

//////

/**
 * 
 */
function createClient(){
    
    //if specific redis provided
    if ( config.redis.port &&  config.redis.host){
        return redis.createClient(config.redis.port, config.redis.host);
    }

    //else, use local
    return redis.createClient();
    
}

 /**
  * 
  * @param {*} key 
  */
function get(key){
    return client.getAsync(key);
}

/**
 * 
 * @param {*} key 
 */
function hgetall(key){
    return new Promise((resolve, reject) => {        
        if ( key === null ) 
            return reject();
        return client.hgetallAsync(key).then(resolve, reject);
    });    
}

/**
 * 
 * @param {*} key 
 */
function lrange(key){
    return client.lrangeAsync(key, [0, -1]);
}

/**
 * 
 * @param {*} key 
 * @param {*} max 
 * @param {*} min 
 */
function zrevrangebyscore(key, max, min){
    return client.zrevrangebyscoreAsync(key, max, min);
}