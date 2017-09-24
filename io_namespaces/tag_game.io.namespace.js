module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name);

    nsp.on('connection', function(socket){

        //variables; 
        var interval_update_room_count = null;
    
        //events
        socket.on('disconnect', onDisconnect);
        socket.on('join-room', onJoinRoom);
        socket.on('send-message-to-room', sendMessageToRoom);
        socket.on('check-how-many-on-room', onCheckHowManyOnRoom);

        return initialize();

        //

        /**
         * 
         */
        function initialize(){
            console.log('connected');
        }

        /**
         * 
         */
        function onDisconnect(){
            console.log('disconnected');
            if ( interval_update_room_count ){
                clearInterval(interval_update_room_count);
            }
        }
        
        /**
         * 
         * @param {*} room_name 
         */
        function onJoinRoom(room_name, username){

            var rooms = Object.keys(socket.rooms);

            //check if room already created
            if ( rooms.indexOf(room_name) > -1 ){
                return socket.emit('join-room', {
                    success : false, 
                    message : 'You have already joined in \'' + room_name + '\' room'  
                });
            }                

            //join room
            socket.join(room_name, () => { 

                var user_data = {
                    id : 'user-id-' + Math.floor(Math.random() * 10000) + '-' + (new Date().getTime()), //create unique id
                    username : username
                };

                //emit join room
                socket.emit('join-room', {
                    success : true, 
                    message : 'Join Room \'' + room_name + '\'',
                    data : user_data         
                });

                updateRoomClientCount(room_name);           
                updateRoomClientCountInterval(room_name); //add intervals

                //trigger on all on room that somebody joined..
                socket.broadcast.emit('somebody-joined', true);                
                
            });      
            
        }

        /**
         * 
         */
        function sendMessageToRoom(room_name, message){
            nsp.to(room_name).emit('send-message-to-room', message);

            nsp.in(room_name).clients((error, clients) => {
                if ( error ){
                    throw error;
                }
            });
        } 

        /**
         * 
         */
        function updateRoomClientCount(room_name){

            //set interval to auto update counts
            return getRoomClientCount(room_name, (err, result) => {
                return socket.emit('update-room-client-count', result);
            });

        }

        /**
         * 
         * @param {*} room_name 
         */
        function updateRoomClientCountInterval(room_name){
            //set interval to auto update counts
            if ( !interval_update_room_count ){
                interval_update_room_count = setInterval(()=> {
                    return updateRoomClientCount(room_name);
                }, 1000);
            }
        }

        /**
         * 
         * @param {*} room_name 
         */
        function onCheckHowManyOnRoom(room_name){
            return getRoomClientCount(room_name, (err, result) => {
                return socket.emit('check-how-many-on-room', result);
            });
        }

        /**
         * 
         * @param {*} room_name 
         * @param {*} cb 
         */
        function getRoomClientCount(room_name, cb){
            nsp.in(room_name).clients((err, clients) => {
                if ( err ){
                    return cb(err, {
                        success : false, 
                        error : err
                    });
                }

                return cb(err, {
                    success : true, 
                    data : clients.length
                });                
            });
        }

    });
    
}