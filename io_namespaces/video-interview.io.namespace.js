var fs = require('fs');

var simple_webrtc_user_service = require('./../services/simple_webrtc.user.service'), 
    video_interview_service = require('./../services/video-interview.service');

var authenticate_helper = require('./helper/video-interview-authenticate.io_namespaces.helper');

/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name); //initialize namespace
    
    //middleware

    //will validate auth token of logged user & will put 
    //logged users information on socket (socket.logged_user_info)
    nsp.use(authenticate_helper.authenticate);
    nsp.on('connection', onConnect);

    /////

    /**
     * 
     * @param {*} socket 
     */
    function onConnect(socket){
        
        //events
        socket.on('disconnect', onDisconnect);
        socket.on('video-interview.update-logged-user-info-by-token', updateLoggedUserInfoByToken);
        
        return onConnect();

        ////

        /**
         * 
         */
        function onConnect(){
           console.log('i connect!', socket.logged_user_info);
        }        

        /**
         * 
         */
        function onDisconnect(){ 
            console.log('i am disconnected...', socket.logged_user_info);
        }

        /**
         * 
         */
        function updateLoggedUserInfoByToken(auth_token){
            console.log('sent token', auth_token);
        }
        
    }    
};