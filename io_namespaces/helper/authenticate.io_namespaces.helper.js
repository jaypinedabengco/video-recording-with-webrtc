var authenticate_service = require('./../../services/authenticate.service');


exports.authenticate = authenticate;


/**
 * Authenticate
 * 
 * @param {*} socket 
 * @param {*} next 
 */
function authenticate(socket, next){
    return new Promise((resolve, reject)=>{
        let auth_token = socket.handshake.query.auth_token;
        if ( !auth_token ){
            console.error('CONNECT_FAILED', 'No Auth Token');
            socket.emit('connect_failed', 'No Auth Token');
            return reject('No Auth Token');
        }
    
        return authenticate_service
                .verifyAndDecodeToken(auth_token)
                .then(logged_user_info => {
                    socket.logged_user_info = logged_user_info;
                    next(); //move next if successful
                    return logged_user_info;
                })
            .then(resolve)
            .catch(err => {
                console.error('CONNECT_FAILED', err);
                return reject(err);
            });
    });
}