var service_chat = require('./../services/chat.service');

/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name);
    
    nsp.on('connection', function(socket){

        //variables
        const socket_id = socket.id;        
        
        //events
        socket.on('chat.register', onRegisterName);
        socket.on('chat.createRoom', onCreateRoom);
        socket.on('chat.joinRoom', onJoinRoom);
        socket.on('chat.sendMessageToRoom.new', onSendMessageToRoom);        
        socket.on('disconnect', onDisconnect);
        
        return initialize();

        ////

        /**
         * Trigger on connect
         */
        function initialize(){
            emit_updateRoomsList();
            console.log('connected');
        }

        /**
         * 
         */
        function onDisconnect(){
            emitAllOnRoom_personLeftRoom()
                .then(
                    () => {
                        console.log('HEY!')
                        //remove all rooms for student
                        service_chat
                            .removeRoomsToUser(socket_id)
                            .then(() => emitAll_updateRoomsList()); //emit update rooms
                        service_chat.unregisterUser(socket_id);
                    }
                )
        }

        /**
         * 
         */
        function onRegisterName(user_info){
            service_chat
                .registerUser(socket_id, user_info)
                .then(
                    (user_info) => socket.emit('chat.register.success', user_info), //send user_info (with id)
                    (err) => socket.emit('chat.register.fail', err)
                )
        }

        /**
         * 
         * @param {*} room_name 
         */
        function onCreateRoom(room_name){
            service_chat
                .createRoom(room_name, socket_id)
                .then(
                    (data) => { //success
                        joinRoom(room_name, socket_id); //join room                        
                        socket.emit('chat.createRoom.success', 'Successfully Created ' + room_name + ' Room');
                        emitAll_updateRoomsList();
                    }, 
                    (err) => { //success
                        socket.emit('chat.createRoom.fail', err);
                    }
                )
        }

        /**
         * 
         */
        function emit_updateRoomsList(){
            return service_chat
                .getAllRooms().then(
                    (rooms) => socket.emit('chat.updateRoomsList', rooms)
                );
        }        

        /**
         * 
         */
        function emitAll_updateRoomsList(){
            return service_chat
                .getAllRooms()
                .then(
                    (rooms) => nsp.emit('chat.updateRoomsList', rooms)
                );
        }

        /**
         * 
         * @param {*} room_name 
         */
        function onJoinRoom(room_name){
            joinRoom(room_name, socket_id); //join room
        }

        /**
         * 
         * @param {*} room_name 
         * @param {*} message 
         */
        function onSendMessageToRoom(room_name, message){
            
            if ( message ){
                service_chat
                    .getUserBySocketId(socket_id)
                    .then(
                        (user_info) => {
                            var message_by_user = {
                                user_name : user_info.name, 
                                message : message
                            }
                            //send to self
                            socket.emit('chat.sendMessageToRoom.success', message);
                            //send to all on room
                            socket.broadcast.to(room_name).emit('chat.sendMessageToRoom.update', message_by_user);
                        }
                    );
            }
        }
        
        /**
         * 
         * @param {*} room_name 
         * @param {*} socket_id 
         */
        function joinRoom(room_name, socket_id){

            socket.join(room_name, () => {

                service_chat
                    .getUserBySocketId(socket_id)
                    .then(
                        (user_info) => {
                            socket.broadcast.to(room_name).emit('chat.newPersonOnRoom', user_info)
                            socket.emit('chat.joinRoom.success', room_name);
                            service_chat.addRoomToUser(socket_id, room_name); //register room to user
                            
                            //update users on rooms list
                            service_chat
                                .getAllUsersInRoom(room_name)
                                .then( users_in_room => socket.broadcast.to(room_name).emit('chat.updateUsersinRoom', users_in_room));                            
                        }
                    );

            });
        }

        /**
         * 
         */
        function emitAllOnRoom_personLeftRoom(){

            return service_chat
                .getUsersInfoAndRooms(socket_id)
                .then(
                    (user_info) => {
                        user_info.rooms.forEach(function(room_name){
                            socket.broadcast.to(room_name).emit('chat.personLeftRoom', user_info)
                        });
                        return user_info;
                    }
                );            
        }
        
    });

}