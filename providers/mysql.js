var mysql = require('mysql');
var config = require('./../configuration');

var pool = mysql.createPool({
    host: config.db.host,
    user: config.db.username, 
    password: config.db.password,
    database: config.db.name,
    port: config.db.port,
    connectionLimit : 100,
    acquireTimeout : (50 * 10000),
    connectTimeout : (50 * 10000)    
});

/**
 * 
 * @param {*} callback 
 */
function getConnection(){
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection)=>{
            if ( error ){
                return reject(error);
            }
            return resolve(connection);
        });
    });

}

module.exports.getConnection = getConnection;