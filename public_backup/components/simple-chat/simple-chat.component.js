'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('simpleChat', {
			templateUrl: 'components/simple-chat/simple-chat.component.html',
			controller: ComponentController
		});

		/////

		ComponentController.$inject = [
			'$scope', 'app.socket.service'		
		];

		function ComponentController(
			$scope, socketService
		) {

			var vm = this;
			
			vm.chat_socket_instance = null;
			vm.show_fail_create_room_error = false;
			vm.logged_user_info = null;
			vm.is_logged_in = false;
			vm.sign_up_user = {};
			vm.rooms_list = [];
			vm.messages_within_the_room = [];
			vm.users_in_room = [];
			vm.current_room = null;
			vm.message = '';

			vm.joinRoom = joinRoom;
			vm.onClickSignUp = onClickSignUp;
			vm.onClickCreateRoom = onClickCreateRoom;
			vm.sendMessageToRoom = sendMessageToRoom;
			vm.initializeAllSocketEventHandlers = initializeAllSocketEventHandlers;

			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){
			}
			
			/**
			 * 
			 */
			function onClickSignUp(){
				if ( !vm.chat_socket_instance ){
					return connectToChat();
				}
			}

			/**
			 * 
			 * @param {*} room_name 
			 */
			function onClickCreateRoom(room_name){
				vm.show_fail_create_room_error = false;
				vm.chat_socket_instance.emit('chat.createRoom', room_name);
			}			

			/**
			 * 
			 * @param {*} message 
			 */
			function sendMessageToRoom(message){
				vm.chat_socket_instance.emit('chat.sendMessageToRoom.new', vm.current_room, message);
			}

			/**
			 * 
			 * @param {*} room_name 
			 */
			function joinRoom(room_name){
				vm.chat_socket_instance.emit('chat.joinRoom', room_name);
			}

			/**
			 * 
			 */
			function connectToChat(){
				vm.chat_socket_instance = socketService.connectToSimpleChat();
				vm.initializeAllSocketEventHandlers();
			}	

			/**
			 * 
			 */
			function initializeAllSocketEventHandlers(){
				//register socket events
				vm.chat_socket_instance.on('connect', socketEventOnConnect);
				vm.chat_socket_instance.on('disconnect', socketEventOnDisconnect);
				vm.chat_socket_instance.on('chat.register.success', socketEventOnRegisterSuccess);
				vm.chat_socket_instance.on('chat.register.fail', socketEventOnRegisterFail);
				vm.chat_socket_instance.on('chat.updateRoomsList', socketOnUpdateRoomsList);
				vm.chat_socket_instance.on('chat.createRoom.success', socketEventCreateRoomSuccess);
				vm.chat_socket_instance.on('chat.createRoom.fail', socketEventCreateRoomFail);
				vm.chat_socket_instance.on('chat.newPersonOnRoom', socketEventNewPersonOnRoom);
				vm.chat_socket_instance.on('chat.personLeftRoom', socketEventPersonLeftRoom);
				vm.chat_socket_instance.on('chat.joinRoom.success', socketEventJoinRoomSuccess);
				vm.chat_socket_instance.on('chat.sendMessageToRoom.update', sockeEventNewMessage);
				vm.chat_socket_instance.on('chat.sendMessageToRoom.success', socketEventSendMessageSuccess);	
				vm.chat_socket_instance.on('chat.updateUsersinRoom', socketEventUpdateUsersInRoom);				
			}
			
			/**
			 * 
			 * @param {*} info 
			 */
			function socketEventCreateRoomSuccess(info){
				console.log('Created Room', info);
			}

			/**
			 * 
			 * @param {*} err 
			 */
			function socketEventCreateRoomFail(err){
				console.log('Failed to Create Room', err);		
				vm.show_fail_create_room_error = true;		
			}

			/**
			 * 
			 */
			function socketEventOnConnect(data){
				console.log('signing up user...');
				if ( !vm.is_logged_in ){
					vm.chat_socket_instance.emit('chat.register', vm.sign_up_user);
				}

			}

			/**
			 * 
			 * @param {*} data 
			 */
			function socketEventOnDisconnect(data){
				console.log('i have disconnected', data);
			}					
			
			/**
			 * 
			 * @param {*} data 
			 */
			function socketEventOnRegisterSuccess(user_info){
				vm.is_logged_in = true;
				vm.logged_user_info = user_info;				
			}

			/**
			 * 
			 * @param {*} response 
			 */
			function socketEventOnRegisterFail(err){
				console.log('unable to signup', err);
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function socketOnUpdateRoomsList(rooms_list){
				console.log('updated rooms list', rooms_list);
				vm.rooms_list = rooms_list;
			}

			/**
			 * 
			 */
			function socketEventNewPersonOnRoom(user_info){
				console.log('new user on room', user_info)
				vm.messages_within_the_room.push({
					message : user_info.name + ' has JOINED', 
					event : true,
					joined_room : true
				});
			}

			function socketEventPersonLeftRoom(user_info){

				var user_to_remove_index = vm.users_in_room.indexOf(user_info);
				var user_to_delete = _.findWhere(vm.users_in_room, {id : user_info.id});

				//remove from list
				if ( user_to_delete && vm.users_in_room.indexOf(user_to_delete) > -1 ){
					vm.users_in_room.splice(vm.users_in_room.indexOf(user_to_delete), 1);
				}

				vm.messages_within_the_room.push({
					message : user_info.name + ' has LEFT THE ROOM', 
					event : true,
					left_room : true
				});
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function socketEventJoinRoomSuccess(room_name){
				console.log('join room success', room_name);
				vm.current_room = room_name;
			}

			/**
			 * 
			 * @param {*} message_info 
			 */
			function sockeEventNewMessage(message_info){
				vm.messages_within_the_room.push(message_info);
				console.log('new message', message_info);
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function socketEventSendMessageSuccess(message){
				vm.message = '';
				vm.messages_within_the_room.push({
					user_name : 'YOU', 
					message : message, 
					own_message : true
				});
			}

			/**
			 * 
			 * @param {*} users_in_room 
			 */
			function socketEventUpdateUsersInRoom(users_in_room){
				vm.users_in_room = users_in_room;
			}
		}		

})();