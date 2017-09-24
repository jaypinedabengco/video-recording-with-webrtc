var express = require('express'), 
    jwt = require('jsonwebtoken');

var config = require('./../configuration');

var router = express.Router();

const EXPIRES_IN_MINUTES = (60 * 60); //(Seconds * N) 60 minutes

//////

router.post('/authenticate', authenticate);

/////

/**
 * Simulate Authentication
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function authenticate(req, res, next){

    var auth_info = req.body;

    if ( !auth_info.username || !auth_info.password ){
        return res.status(400).json({
            success : false, 
            message : "Invalid username or password"
        });
    }

    //build sample info
    var user_info = {
        id : "random-id-" + (Math.ceil(Math.random() * 10000)),
        username : auth_info.username
    }

    var auth_token = jwt.sign(user_info, config.jwt_secret_key, { expiresIn : EXPIRES_IN_MINUTES});

    return res.status(200).json({
        success : true, 
        message : "Logged in successfully", 
        data : auth_token
    });
}

module.exports = router;