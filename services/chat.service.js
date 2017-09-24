var dao_chat_user = require('./../daos/chat_user.redis.dao');
var dao_chat_room = require('./../daos/chat_room.redis.dao');

///

exports.registerUser = registerUser;
exports.getUserBySocketId = getUserBySocketId;
exports.getAllRooms = getAllRooms;
exports.createRoom = createRoom;
exports.addRoomToUser = addRoomToUser;
exports.getUsersInfoAndRooms = getUsersInfoAndRooms;
exports.removeRoomsToUser = removeRoomsToUser;
exports.unregisterUser = unregisterUser;
exports.getAllUsersInRoom = getAllUsersInRoom;

////

/**
 * 
 */
function registerUser(socket_id, user){
    
    if ( !user.name ){
        return Promise.reject('username is required');
    }
        
    return dao_chat_user
        .addUserInformation(socket_id, user);
}

/**
 * 
 * @param {*} socket_id 
 */
function getUserBySocketId(socket_id){
    return dao_chat_user
        .getUserBySocketId(socket_id);
}

/**
 * 
 */
function getAllRooms(){
    return dao_chat_room
        .getAllRooms();
}

/**
 * 
 * @param {*} room_name 
 * @param {*} socket_id 
 */
function createRoom(room_name, socket_id){
    console.log('creating room service', room_name, socket_id);
    
    return dao_chat_room
        .getRoom(room_name)
        .then((result) => {
            if ( result ){ //already exists, then reject
                return Promise.reject('Room ' + room_name + ' already exists');
            }
            //build room info to use by next promise
            return Promise.resolve({room_name : room_name, socket_id : socket_id});
        })
        .then(dao_chat_room.createRoom)
        .then((data) => room_name) //set room_name as next value on request
        .then(dao_chat_room.addToRoomList) //add room to list
        .catch(
            (err) => {
                console.log('error', err);
                return Promise.reject(err);
            }
        ); 

}

/**
 * 
 * @param {*} socket_id 
 */
function getUsersInfoAndRooms(socket_id){

    return Promise
        .all([
            dao_chat_user.getUserBySocketId(socket_id), 
            dao_chat_user.getUsersRooms(socket_id)])
        .then(results => {
            var user_info = results[0];
                user_info.rooms = results[1];
            return user_info;
        });

}

/**
 * 
 * @param {*} socket_id 
 * @param {*} room_name 
 */
function addRoomToUser(socket_id, room_name){

    var room_registeration_model = {
        socket_id : socket_id, 
        room_name : room_name
    };   

    return Promise
            .all([
                dao_chat_user.registerRoomToUser(room_registeration_model), 
                dao_chat_room.addUserToRoom(room_registeration_model)
            ]);
}

/**
 * 
 * @param {*} socket_id 
 */
function removeRoomsToUser(socket_id){
    
    return dao_chat_user
        .getUsersRooms(socket_id)
        .then(rooms => {
    
                //remove to rooms
                rooms.forEach(
                    room_name => {
                        dao_chat_room.removeUserToRoom(room_name, socket_id);
                    });
                dao_chat_user.unregisterRoomToUser(socket_id); //remove users rooms

                //validate rooms, if has empty, then remove room
                rooms.forEach(room_name => {

                    dao_chat_room
                        .getAllUsersInRoom(room_name)
                        .then(users_in_room => {
                            if (users_in_room.length <= 0) //if no more users then remove
                                dao_chat_room.removeRoomToList(room_name)
                        });

                });

                return rooms;
            }
        )
}

/**
 * 
 * @param {*} socket_id 
 */
function unregisterUser(socket_id){
    return dao_chat_user.removeUserInformation(socket_id);
}

/**
 * 
 * @param {*} room_name 
 */
function getAllUsersInRoom(room_name){
    console.log('get all', room_name);
    return dao_chat_room
        .getAllUsersInRoom(room_name)
        .then((data) => { 
            console.log('hello', data)
            return Promise.all(data.map(dao_chat_user.getUserBySocketId))
        });
}