'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('tagGame', {
			templateUrl: 'components/tag-game/tag-game.component.html',
			controller: ComponentController
		});

		/////

		ComponentController.$inject = [
			'$scope', 'app.socket.service'		
		];

		function ComponentController(
			$scope, sockerService
		) {

			var vm = this;
			
			vm.room_name = '';
			vm.user_name = '';
			vm.user_data = null;
			vm.other_users = [];
			vm.client_on_room_count = 0;
			vm.chat_messages = [];
			vm.game_started = false;

			//get socket
			vm.io_tag_game = sockerService.getTagGame();
			
			//functions
			vm.startGame = startGame;
			vm.joinRoom = joinRoom;
			vm.sendMessageToRoom = sendMessageToRoom;

            //socket events
            vm.io_tag_game.on('connect', socketOnConnect);
			vm.io_tag_game.on('disconnect', socketOnDisconnect);
			vm.io_tag_game.on('join-room', socketJoinRoom);
			vm.io_tag_game.on('send-message-to-room', socketSendMessageToRoom);
			vm.io_tag_game.on('update-room-client-count', socketUpdateRoomCount);
			vm.io_tag_game.on('somebody-joined', socketSomebodyJoined);

			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){
			}

			/**
			 * 
			 */
			function joinRoom(){
				vm.io_tag_game.emit('join-room', vm.room_name, vm.user_name);
			}

			/**
			 * 
			 * @param {*} game_data 
			 */
			function startGame(game_data){
				if ( !game_data.success ){
					return console.log('Unable to start game', game_data.message);
				}

				vm.user_data = game_data.data; //do something here
				console.log('start game', game_data);
				vm.game_started = true;
			}
            
            /**
             * 
             * @param {*} message 
             */
            function socketOnConnect(data){
				console.log('i have connected', data);
				//trigger get available rooms
				vm.io_tag_game.emit('get-available-rooms');
            }

            /**
             * 
             * @param {*} data 
             */
            function socketOnDisconnect(data){
				console.log('i have disconnected', data);
				vm.game_started = false;
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function socketJoinRoom(data){
				vm.startGame(data);
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function sendMessageToRoom(message){
				vm.io_tag_game.emit('send-message-to-room', vm.room_name, message);
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function socketSendMessageToRoom(message){
				vm.chat_messages.push(message);
			}

			/**
			 * 
			 * @param {*} count 
			 */
			function socketUpdateRoomCount(result){
				console.log(result);
				vm.client_on_room_count = result.data;
			}

			/**
			 * Emit update position
			 */
			function socketSomebodyJoined(data){

			}

			/**
			 * 
			 * @param {*} user_data 
			 */
			function usersUpdateData(user_data){
				console.log(user_data);
			}


		}		

})();