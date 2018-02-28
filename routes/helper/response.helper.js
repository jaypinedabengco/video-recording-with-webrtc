////

module.exports.success = success;
module.exports.fail = fail;

////

/**
 * 
 * @param {*} message 
 * @param {*} data 
 * @param {*} res 
 */
function success(message, data, res){
    return res.status(200).json({
        success: true, 
        message: message, 
        data: data
    });
}

/**
 * 
 * @param {*} error_code 
 * @param {*} message 
 * @param {*} data 
 * @param {*} res 
 * @param {*} next 
 */
function fail(error_code, message, data, res, next){
    res.status(error_code).json({
        success: false, 
        message: message, 
        data: data
    });

    return next();
}