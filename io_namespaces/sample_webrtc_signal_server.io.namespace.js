var simple_webrtc_user_service = require('./../services/simple_webrtc.user.service');

/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name); //initialize namespace
    
    nsp.on('connection', function(socket){

        //variables;
        var socket_id = socket.id;
        
        //events
        socket.on('disconnect', onDisconnect);
        socket.on('login', onLogin); 
        socket.on('offer', onOffer);
        socket.on('answer', onAnswer);
        socket.on('candidate', onCandidate);
        socket.on('leave', onLeave);
        
        return onConnect();

        ////

        /**
         * 
         * @param {*} username 
         */
        function onLogin(data){

            var username = data.username;
            console.log("User logged:", username);    

            if ( !username ){
                return socket.emit('login.error', 'username is required');
            }

            //do login
            simple_webrtc_user_service
                .setUser(username, socket.id)
                .then(
                    message => { 
                        socket.emit('login.success', {username : username});
                        socket.username = username; //add username on socket cache
                        emit_updateUsersOnList();
                    },
                    error => socket.emit('login.error', error)
                )
        }
        
        /**
         * 
         * @param {*} target_username 
         */
        function onOffer(data){

            var target_username = data.target_username;
            var offer = data.offer;

            console.log("Sending offer to: ", target_username, offer); 

            var caller_username = socket.username;

            //offer to target

            sendToTargetUser(target_username, 'incoming.offer', {
                caller_username : caller_username,
                offer : offer
            }).then(
                target_user => {
                    console.log('hey!');
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

            console.log("Sending answer to: ", target_username);  

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

            console.log("Sending candidate to:", target_username); 

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

            simple_webrtc_user_service
                .getUser(target_username)
                .then(
                    target_user => {
                        socket.emit('onleave.success', true); //send to self
                        io.broadcast.to(target_user.socket_id).emit('incoming.onleave', 'left'); //send to target
                    }, 
                    error => socket.emit('onleave.error', error)
                )             
            
        }

        /**
         * 
         */
        function onConnect(){
            console.log('connected');
            socket.emit("Hello from server");             
        }

        /**
         * 
         */
        function onDisconnect(){

            console.log('socket username on disconnect', socket.username);
            if ( socket.username ){//delete on users list
                simple_webrtc_user_service
                    .deleteUser(socket.username);
            
                var target_username = socket.target_username;
                if ( target_username ){ //notify target username that you have been disconnected
                    console.log("Disconnecting from ", target_username);                     
                    simple_webrtc_user_service
                        .getUser(target_username)
                        .then(
                            target_user => io.broadcast.to(target_user.socket_id).emit('incoming.onleave', 'disconnected') //send to target
                        )  
                }                    
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
                .then(
                    usernames => nsp.emit('available_users_for_call.update', usernames)
                )
        }
        
    });

}