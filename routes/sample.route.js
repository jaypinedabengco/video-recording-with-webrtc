var express = require('express');
var router = express.Router();

//////

router.get('/sample', sample);

/////

function sample(req, res, next){
    return res.status(200).json({hello:"world"});
}

module.exports = router;