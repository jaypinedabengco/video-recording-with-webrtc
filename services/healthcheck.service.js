var redis = require('./../providers/redis'), 
    config = require('./../configuration');

exports.checkHealth = checkHealth;
exports.getRedisStatus = getRedisStatus;

////

/**
 * 
 */
function checkHealth(){
    return new Promise((resolve, reject) => {
        const status_container = {};
        
        //get statuses

        getRedisStatus() //get redis status
            .then((redis_status) => {
                status_container.redis = redis_status;
            })
            .then(() => resolve(status_container), reject)
            .catch(reject);
    });
}

/**
 * 
 */
function getRedisStatus(){
    const redis_status = {
        host : config.redis.host, 
        port: config.redis.port,
        status : 0
    };
    
    return redis
        .get('test')
        .then(() => {
            redis_status.status = 1;
            return redis_status;
        }).catch(err => {
            redis_status.error = err;
            return redis_status;
        });
}