var express = require('express');
var router = express.Router();

var healthcheck_service = require('./../services/healthcheck.service');

//////

router.get('/healthcheck', healthcheck);
router.get('/shallowcheck', healthcheck);


/////

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function healthcheck(req, res, next){
    return healthcheck_service
        .checkHealth()
        .then(health_check => res.status(200).json(health_check))
        .catch(err => res.status(500).json(err));
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function shallowcheck(req, res, next){
    return res.status(200).json({status:1});
}

module.exports = router;