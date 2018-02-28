exports.promiser = promiser;

/**
 * Convert usual query results to Promise
 * 
 * @param {*} resolve 
 * @param {*} reject 
 */
function promiser(resolve, reject){
    return (err, resultSet) => {
        if ( err ){
            return reject(err);
        }
        return resolve(resultSet);
    };
}