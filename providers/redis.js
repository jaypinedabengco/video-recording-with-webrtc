var redis = require('redis');
var bluebird = require('bluebird');
var config = require('./../configuration');
var promiser = require('./../utils/promise.util').promiser;

//promisify all
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

//initialize client 
const client = createClient();

////

module.exports.createClient = createClient;
module.exports.client = client;

module.exports.set = set;
module.exports.get = get;

module.exports.hmset = hmset;
module.exports.hgetall = hgetall;

module.exports.lrange = lrange;

module.exports.zadd = zadd;
module.exports.zrangebyscore = zrangebyscore;
module.exports.zrevrangebyscore = zrevrangebyscore; 



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
 * @param {*} value 
 */
function set(key, value){
    return new Promise((resolve, reject) => {
        return client.set(key, value, promiser(resolve, reject));
    });
}

 /**
  * 
  * @param {*} key 
  */
function get(key){
    return new Promise((resolve, reject) => {
        return client.get(key, promiser(resolve, reject));
    });
}

/**
 * 
 * @param {*} key 
 * @param {*} value 
 */
function hmset(key, value){
    return new Promise((resolve, reject) => {
        return client.hmset(key, value, promiser(resolve, reject));
    });
}

/**
 * 
 * @param {*} key 
 */
function hgetall(key){
    return new Promise((resolve, reject) => {        
        if ( key === null ) 
            return reject();
        return client.hgetall(key, promiser(resolve, reject));
    });    
}

/**
 * 
 * @param {*} key 
 */
function lrange(key){
    return new Promise((resolve, reject) => {
        return client.lrange(key, [0, -1], promiser(resolve, reject));
    });    
}

/**
 * 
 * @param {*} key 
 * @param {*} score 
 * @param {*} value 
 */
function zadd(key, score, value){
    return new Promise((resolve, reject) => {
        return client.zadd(key, [score, value], promiser(resolve, reject));
    });    
}

/**
 * 
 * @param {*} key 
 * @param {*} min
 * @param {*} max  
 */
function zrangebyscore(key, min, max){
    return new Promise((resolve, reject) => {
        return client.zrangebyscore(key, min, max, promiser(resolve, reject));
    });
}

/**
 * 
 * @param {*} key 
 * @param {*} min
 * @param {*} max 
 */
function zrevrangebyscore(key, min, max){
    return new Promise((resolve, reject) => {
        return client.zrevrangebyscore(key, min, max, promiser(resolve, reject));
    });
}