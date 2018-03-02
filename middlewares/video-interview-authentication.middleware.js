var video_interview = require('./../services/video-interview.user.service');

/**************************************************************************
 * MIDDLEWARE to use for all requests, can add authentication here
 *************************************************************************/
module.exports = function(req, res, next) {

  // check header or url parameters or post parameters for token
  var auth_token = req.body.x_access_token || req.query.x_access_token || req.headers['x-access-token'];

  // decode auth_token
  if (auth_token) {
    video_interview
        .decodeAuthToken(auth_token)
        .then(user_info => {
            console.log('user_info', user_info);

            //remove unneccessary jwt data
            delete user_info.iat;
            delete user_info.exp;

            req.logged_user = user_info;
            next();
        })
        .catch(err => {

            let error_message = err;
            if ( err.message ){
                error_message = err.message;
            }

            return res.status(403).json({
                message: 'Authentication Failed', 
                error : error_message
            });    
        });
  } else {
    // if there is no token
    // return an error
    //return res.status(403).send(response_util.failResponse(req, "Authentication Failed","No token provided."));
    next();
  }
};