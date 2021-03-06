var express = require('express'), 
    jwt = require('jsonwebtoken');

var config = require('./../configuration');
var authentication_service = require('./../services/authenticate.service');
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

    authentication_service
        .authenticate(auth_info.username, auth_info.password)
        .then(
            (user_info) => {
                var auth_token = jwt.sign(user_info, config.jwt_secret_key, { expiresIn : EXPIRES_IN_MINUTES});
                return res.status(200).json({
                    success : true, 
                    message : "Logged in successfully", 
                    data : auth_token
                });
            }        
        ).catch(err => res.status(400).json({
            success : false, 
            message : err
        })
    );
}

module.exports = router;