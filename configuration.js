/*
Sample Configuration file
*/
const CONFIGURATION = {
    http_port : process.env.HTTP_PORT || 8081, 
    https_port : process.env.HTTPS_PORT || 8444,
    jwt_secret_key : process.env.JWT_SECRET_KEY || 'ABCD123', 
    redis : {
        host : process.env.REDIS_HOST || '127.0.0.1', 
        port : process.env.REDIS_PORT || 16379
    },
    aws : {
        accessKeyId : process.env.AWS_ACCESS_KEY,
        secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
    }
};

module.exports = CONFIGURATION;