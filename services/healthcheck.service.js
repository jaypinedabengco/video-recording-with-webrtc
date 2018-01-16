var redis = require('./../providers/redis'), 
    db = require('./../providers/mysql'),
    config = require('./../configuration');

exports.checkHealth = checkHealth;
exports.getRedisStatus = getRedisStatus;
exports.getDBStatus = getDBStatus;

////

/**
 * 
 */
function checkHealth(){
    return new Promise((resolve, reject) => {
        const status_container = {};
        
        //get statuses

        getRedisStatus() //get redis status
            .then(redis_status => status_container.redis = redis_status)
            .then(() => getDBStatus())
            .then(db_status => status_container.db = db_status)
            .then(() => resolve(status_container), reject)
            .catch(reject);
    });
}

/**
 * 
 */
function getRedisStatus(){
    let redis_status = {
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
            console.log('error', err);
            redis_status.error = err;
            return redis_status;
        });
}

/**
 * 
 */
function getDBStatus(){

    let db_status = {
        host : config.db.host, 
        name: config.db.name,
        port: config.db.port,
        status : 0
    };

    return db
        .getConnection()
        .then((connection)=>{
            let sql = 'SELECT 1 + 1 ';
            connection.query(sql, [], (err, result_set) => {
                if ( err ){
                    connection.release();
                    return Promise.reject(err);
                }
                connection.release();
                return true;
            });
        })
        .then(() => {
            db_status.status = 1;
            return db_status;
        })
        .catch(err => {
            console.log('error', err);
            db_status.error = err;
            return db_status;
        });

}