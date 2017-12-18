var express = require('express');
var router = express.Router();

var healthcheck_service = require('./../services/healthcheck.service');

//////

router.get('/healthcheck', healthcheck);

/////

function healthcheck(req, res, next){
    return healthcheck_service
        .checkHealth()
        .then(health_check => res.status(200).json(health_check))
        .catch(err => res.status(500).json(err));
}

module.exports = router;