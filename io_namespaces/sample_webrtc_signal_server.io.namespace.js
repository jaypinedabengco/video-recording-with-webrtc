var fs = require('fs');

const RECORDED_VIDEOS_LOCATION = __basedir + '/tmp_recorded_videos/';

var simple_webrtc_user_service = require('./../services/simple_webrtc.user.service'), 
    authenticate_service = require('./../services/authenticate.service'), 
    video_interview_service = require('./../services/video-interview.service');

/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name); //initialize namespace
    
    //middleware
    nsp.use(authenticate);

    nsp.on('connection', onConnect);

    function authenticate(socket, next){
        var auth_token = socket.handshake.query.auth_token;
        if ( !auth_token ){
            console.error('CONNECT_FAILED', 'No Auth token');
            return socket.emit('connect_failed', 'No Auth token');
        }

        authenticate_service
            .verifyAndDecodeToken(auth_token)
            .then(
                (logged_user_info) => {
                    socket.logged_user_info = logged_user_info;
                    next(); //move next if successful
                }
            ).catch(err => console.error('CONNECT_FAILED', err));
    }
    /**
     * 
     * @param {*} socket 
     */
    function onConnect(socket){
        
        //variables;
        var socket_id = socket.id;
        var ongoing_video_recorder = null;
        
        //events
        socket.on('disconnect', onDisconnect);
        socket.on('offer', onOffer);
        socket.on('answer', onAnswer);
        socket.on('candidate', onCandidate);
        socket.on('leave', onLeave);
        socket.on('startRecording', onStartRecording);
        socket.on('recordVideoChunks', onRecordVideoChunks);
        socket.on('stopRecording', onStopRecording);
        
        return onConnect();

        ////

        /**
         * 
         */
        function onConnect(){
            simple_webrtc_user_service
                .setUser(socket.logged_user_info.username, socket.logged_user_info, socket.id)
                .then(
                    message => { 
                        socket.emit('login.success', {username : socket.logged_user_info.username});
                        socket.username = socket.logged_user_info.username; //add username on socket cache
                        emit_updateUsersOnList();
                    },
                    error => socket.emit('login.error', error)
                )
        }        

        /**
         * 
         * @param {*} message 
         */
        function onStartRecording(message){
            if ( ongoing_video_recorder ){
                return socket.emit('recording.error', 'there is an ongoing recording');
            }

            //initialize video recording stream
            video_interview_service
                .createVideoRecorder()
                .then(
                    (video_recorder) => {
                        ongoing_video_recorder = video_recorder;
                    }
                )
            
        }

        /**
         * 
         * @param {*} video_chunks 
         */
        function onRecordVideoChunks(video_chunks){
            ongoing_video_recorder
                .addVideoChunk(video_chunks);
        }

        /**
         * 
         * @param {*} message 
         */
        function onStopRecording(message){
            video_interview_service
                .stopRecording(ongoing_video_recorder)
                .then(
                    () => {
                        ongoing_video_recorder = null; //open up for new recorder
                    }, 
                    (err) => console.log("onStopRecording Error", err)
                )
        }
        
        /**
         * 
         * @param {*} target_username 
         */
        function onOffer(data){

            var target_username = data.target_username;
            var offer = data.offer;
            var caller_username = socket.username;

            //offer to target

            sendToTargetUser(target_username, 'incoming.offer', {
                caller_username : caller_username,
                offer : offer
            }).then(
                target_user => {
                    socket.target_username = target_username; //add target_username to socket cache
                    socket.emit('offer.success', {target_username : target_username}); //send to self          
                }, 
                error => socket.emit('offer.error', error)
            );
            
        }

        /**
         * 
         * @param {*} target_username 
         * @param {*} answer 
         */
        function onAnswer(data){
            
            var target_username = data.target_username;
            var answer = data.answer;
            sendToTargetUser(target_username, 'incoming.answer', answer)
                .then(
                    target_user => {
                        socket.target_username = target_username; //add target_username to socket cache
                        socket.emit('answer.success', true); //send to self                                                
                    },
                    error => socket.emit('answer.error', error)
                )    
        }

        /**
         * 
         * @param {*} target_username 
         * @param {*} candidate 
         */
        function onCandidate(data){
            var target_username = data.target_username;
            var candidate = data.candidate;
            sendToTargetUser(target_username, 'incoming.candidate', candidate)
                .then(
                    target_user => {
                        socket.target_username = target_username; //add target_username to socket cache
                        socket.emit('candidate.success', true); //send to self                        
                    },
                    error => socket.emit('candidate.error', error)
                )               
        }

        /**
         * 
         * @param {*} target_username 
         */
        function onLeave(data){
            var target_username = data.target_username;
            socket.target_username = null;

            sendToTargetUser(target_username, 'incoming.onleave', 'left')
                .then(target_user =>  socket.emit('onleave.success', true), //send to self
                    error => socket.emit('answer.error', error))
                .then(simple_webrtc_user_service.deleteUser(socket.username))
                .then(emit_updateUsersOnList());
        }

        /**
         * 
         */
        function onDisconnect(){ 

            if ( socket.username ){//delete on users list
                simple_webrtc_user_service
                    .deleteUser(socket.username);
                var target_username = socket.target_username;
                if ( target_username ){ //notify target username that you have been disconnected
                    simple_webrtc_user_service
                        .getUser(target_username)
                        .then(
                            target_user => {
                                //send to target
                                ( target_user ) ? io.to(target_user.socket_id).emit('incoming.onleave', 'disconnected') : '' 
                            }
                        )  
                }                    
            }

            //end recording
            video_interview_service
                .stopRecording(ongoing_video_recorder)
                .then(
                    () => {
                        ongoing_video_recorder = null; //open up for new recorder
                    }, 
                    (err) => console.log("onStopRecording Error", err)
                )
            
        }

        /**
         * 
         * @param {*} target_username 
         */
        function sendToTargetUser(target_username, emit_type, content){
            return simple_webrtc_user_service
                .getUser(target_username)
                .then(
                    target_user => { 
                        nsp.to(target_user.socket_id).emit(emit_type, content) //send to target
                        return target_user;
                    }
                )
        }

        /**
         * 
         */
        function emit_updateUsersOnList(){
            return simple_webrtc_user_service
                .getAllUsernames()
                .then(usernames => nsp.emit('available_users_for_call.update', usernames))
        }
        
    }    

}