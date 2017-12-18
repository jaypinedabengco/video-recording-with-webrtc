var express = require('express');
var router = express.Router();
var util = require('util');

var service_redis_sample = require('./../services/sample.redis.service');

//////

router.get('/redis/sample/initialize', initializeRedisSample);
router.get('/redis/sample/counter', redisSampleCounter);
router.get('/redis/sample/subscribe', redisSampleSubscribe);
router.get('/redis/sample/publish', redisSamplePublish);
router.get('/redis/sample/dog/name/:name', getDogByName);
router.get('/redis/sample/dog/age/:age', getDogByAge);
router.get('/redis/sample/dog/any', getDogAny);
router.get('/redis/sample/dog/latest', getDogLatest);

/////

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getDogAny(req, res, next){
    service_redis_sample
        .getDogAny()
        .then(
            (dogs) => {return res.status(200).json(dogs);}, 
            (err) => {return res.status(303).json(err);}
        );
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getDogLatest(req, res, next){
    service_redis_sample
        .getDogLatest()
        .then(
            (dog) => {return res.status(200).json(dog)}, 
            (err) => {return res.status(303).json(err)}
        );
}

function initializeRedisSample(req, res, next){
    service_redis_sample.initializeRedisSample();
    return res.status(200).json("INITIALIZED");    
}

function redisSampleCounter(req, res, next){
    service_redis_sample.initializeSampleCounter();
    service_redis_sample.incrementAndGetSampleCounterValue((err, value) =>{
        if ( err ){
            return res.status(500).json(err);
        }
        return res.status(200).json(value);
    });
}

function redisSampleSubscribe(req, res, next){
    service_redis_sample.initializeSubscriber((err, result)=>{
        if ( err ){
            return res.status(500).json(err);
        }
        return res.status(200).json(result);
    });
    
    
}

function redisSamplePublish(req, res, next){
    service_redis_sample.samplePublish();
    return res.status(200).json("PUBLISHED");
    
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getDogByName(req, res, next){
    service_redis_sample
        .getDogByName(req.params.name)
        .then(
            (dog) => {return res.status(200).json(dog)}, 
            (err) => {return res.status(303).json(util.format('Dog with name \'%s\' not found', req.params.name))}
        )
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function getDogByAge(req, res, next){
    service_redis_sample
        .getDogByAge(req.params.age)
        .then(
            (dog) => {return res.status(200).json(dog)}, 
            (err) => {return res.status(303).json(err)}
        )
}

module.exports = router;