exports.setSampleCounterKey = setSampleCounterKey;
exports.getSampleCounterKey = getSampleCounterKey;
exports.incrementSampleCounterKey = incrementSampleCounterKey;

///

/**
 * 
 * @param {*} key 
 */
function setSampleCounterKey(key, client){
    return client.set(key, '0');
}

/**
 * 
 */
function getSampleCounterKey(key, client, callback){
    return client.get(key, callback);
}

/**
 * 
 * @param {*} key 
 */
function incrementSampleCounterKey(key, client){
    return client.incr(key);    
}
