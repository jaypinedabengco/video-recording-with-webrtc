/*
Sample Configuration file
*/
const CONF = {
    http_port : 8081, 
    https_port : 8444,
    jwt_secret_key : 'ABCD123', 
    redis : {
        host : '127.0.0.1', 
        port : 16379
    }
};

module.exports = CONF;