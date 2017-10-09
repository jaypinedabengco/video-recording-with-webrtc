var fs = require('fs');

const RECORDED_VIDEOS_LOCATION = __basedir + '/tmp_recorded_videos/';

var simple_webrtc_user_service = require('./../services/simple_webrtc.user.service'), 
    authenticate_service = require('./../services/authenticate.service');

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
        console.log('auth_token', auth_token);
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
        var ongoing_video_recording_stream = null;

        console.log('logged_user_info', socket.logged_user_info);
        
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
            if ( ongoing_video_recording_stream ){
                return socket.emit('recording.error', 'there is an ongoing recording');
            }

            //initialize video recording stream

            //create temporary video location
            if ( !fs.existsSync(RECORDED_VIDEOS_LOCATION) ){
                fs.mkdirSync(RECORDED_VIDEOS_LOCATION);
            }

            ongoing_video_recording_stream = fs.createWriteStream(RECORDED_VIDEOS_LOCATION + 'sample-' + (new Date().getTime()) + '.webm');

            ongoing_video_recording_stream.on('error', error => {
                console.log('hey!, error', error)
            });

            //setup on end
            ongoing_video_recording_stream.on('finish', data => {
                console.log('hey! the stream ended', data);
            });
            
            console.log('onStartRecording', message);
        }

        /**
         * 
         * @param {*} video_chunks 
         */
        function onRecordVideoChunks(video_chunks){
            console.log('onRecordVideoChunks', video_chunks);      
            ongoing_video_recording_stream.write(video_chunks);      
        }

        /**
         * 
         * @param {*} message 
         */
        function onStopRecording(message){
            console.log('stopRecording', message);   
            setTimeout(function () {
                ongoing_video_recording_stream.end();
                ongoing_video_recording_stream = null;
            }, 1000);                     
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
            console.log("Disconnecting from", target_username); 
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
                            target_user => target_user ? io.broadcast.to(target_user.socket_id).emit('incoming.onleave', 'disconnected') : '' //send to target
                        )  
                }                    
            }

            //end recording
            if ( ongoing_video_recording_stream ){
                setTimeout(function () {
                    if ( ongoing_video_recording_stream ){
                        ongoing_video_recording_stream.end();
                        ongoing_video_recording_stream = null;
                    }
                }, 1000);   
            }
            
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
                        console.log(emit_type, content, target_user);
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