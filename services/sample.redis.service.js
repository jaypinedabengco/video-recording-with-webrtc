var redis = require('./../providers/redis'), 
    util = require('util');

var redis_dao_sample = require('./../daos/sample.redis.dao');

const SAMPLE_COUNTER_KEY = 'sample:counter:01';
var subscriber_initialized = false;

exports.initializeRedisSample = initializeRedisSample;
exports.initializeSampleCounter = initializeSampleCounter;
exports.incrementAndGetSampleCounterValue = incrementAndGetSampleCounterValue;
exports.samplePublish = samplePublish;
exports.initializeSubscriber = initializeSubscriber;
exports.getDogByName = getDogByName;
exports.getDogByAge = getDogByAge;
exports.getDogAny = getDogAny;
exports.getDogLatest = getDogLatest;

///

/** */
function getDogAny(){
    return redis
        .zrevrangebyscore('dog:last-lookup', '+inf', '-inf')
        .then((data) => Promise.all(data.map(redis.get)))
        .then((data) => Promise.all(data.map(redis.hgetall)))        
}

/**
 * 
 */
function getDogLatest(){
    var now = Date.now();
    var minuteAgo = now - 60000;

    return redis.zrevrangebyscore('dog:last-lookup', now, minuteAgo)
        .then((data) => Promise.all(data.map(redis.get)))
        .then((data) => Promise.all(data.map(redis.hgetall)));
}

/**
 * 
 * @param {*} name 
 */
function getDogByName(name){
    var now = Date.now();
    redis.client.zadd('dog:last-lookup', [now, util.format('dog:name:%s', name)]);

    return redis
            .get(util.format('dog:name:%s', name))
            .then((data) => { //save last lookup
                redis.client.hset(data, 'last-lookup', now);
                return data;
            })
            .then(redis.hgetall); //get info 
}

/**
 * 
 * @param {*} age 
 */
function getDogByAge(age){
    return redis.lrange('dog:age:' + age)
        .then((data) => Promise.all(data.map(redis.hgetall)));
        
}

function initializeRedisSample(){
    redis.client.flushall()//delete all
    
    //initial data
    redis.client.hmset('dog:1', ['name', 'gizmo', 'age', '5']);
    redis.client.hmset('dog:2', ['name', 'dexter', 'age', '6']);
    redis.client.hmset('dog:3', ['name', 'fido', 'age', '5']);
    redis.client.hmset('dog:4', {name : 'john', age: '4'});

    //register username ( for unique ) NOTE: currently setting dog names as unique
    redis.client.set('dog:name:gizmo', 'dog:1');
    redis.client.set('dog:name:dexter', 'dog:2');
    redis.client.set('dog:name:fido', 'dog:3');

    //ages (for not unique properties )
    redis.client.lpush('dog:age:5', ['dog:1', 'dog:3']);
    redis.client.lpush('dog:age:6', 'dog:2');

}

/**
 * 
 */
function samplePublish(){
    redis.createClient().publish('REQUEST', {name : 'john', gender : 'hello'}.toString());
}

/**
 * 
 */
function initializeSubscriber(callback){
    if ( !subscriber_initialized ){
        var redis_client =  redis.createClient();
        subscriber_initialized = true;

        redis_client.on('message', (channel, message)=>{
            console.log(message.toString());
        });

        redis_client.subscribe('REQUEST');
        return callback(null, 'SUBSCRIBED');
    }
    return callback(null, 'ALREADY SUBSCRIBED');
}

/**
 * 
 * @param {*} key 
 */
function initializeSampleCounter(){
    var redis_client = redis.client();
    redis_dao_sample.getSampleCounterKey(SAMPLE_COUNTER_KEY, redis.getClient(), (err, result)=>{
        if ( !result ){
            return redis_dao_sample.setSampleCounterKey(SAMPLE_COUNTER_KEY, redis_client);
        }
    });
    // 
}

/**
 * 
 */
function incrementAndGetSampleCounterValue(callback){
    var redis_client = redis.client();
    redis_dao_sample.incrementSampleCounterKey(SAMPLE_COUNTER_KEY, redis_client);
    return redis_dao_sample.getSampleCounterKey(SAMPLE_COUNTER_KEY, redis_client, callback);
}
