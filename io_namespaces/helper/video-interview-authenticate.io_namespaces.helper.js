var video_interview_user_service = require('./../../services/video-interview.user.service');

///

exports.authenticate = authenticate;

///

/**
 * Authenticate
 * 
 * @param {*} socket 
 * @param {*} next 
 */
function authenticate(socket, next){
    return new Promise((resolve, reject)=>{

        //get auth token from socket
        let auth_token = socket.handshake.query.auth_token;

        if ( !auth_token ){
            console.error('CONNECT_FAILED', 'No Auth Token');
            socket.emit('connect_failed', 'No Auth Token');
            return reject('No Auth Token');
        }
    
        return video_interview_user_service.decodeAuthToken(auth_token)
            .then(logged_user_info => {
                socket.logged_user_info = logged_user_info;
                next();
                return logged_user_info;
            })
            .catch(err => {
                console.error('CONNECT_FAILED', err);
                return reject(err);
            });
    });
}