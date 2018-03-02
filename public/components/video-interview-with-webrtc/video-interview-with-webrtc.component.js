'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('videoInterviewWithWebrtc', {
			templateUrl: 'components/video-interview-with-webrtc/video-interview-with-webrtc.component.html',
			controller: ComponentController
		});

		/////

		ComponentController.$inject = [
			'$q', '$scope', 
			'app.socket.service', 'app.webrtc.service', 
			'app.dataservice.video-interview-authentication'		
		];

		function ComponentController(
			$q, $scope, 
			socketService, webrtcService, 
			authenticationDataservice
		) {

			var vm = this;
			
			//variables
			vm.is_logged_in = false;
			vm.logged_user_info = {};
			vm.processing_is_logged_in = true;
			vm.socket_io_connection = {};
			vm.users_list = [];

			//functions
			vm.connectToVideoInterviewSocket = connectToVideoInterviewSocket;
			vm.getLoggedUserInfo = getLoggedUserInfo;
			vm.login = login;
			vm.logout = logout;

			//socket io event handlers
			vm.io_eventHandlers = {
				onConnect : io_event_onConnect
			};

			//socket io functions
			vm.io_emitters = {
				updateUserByAuthToken : io_emit_updateUserByAuthToken
			};

			vm.updateSocketUserInfo = io_emit_updateUserByAuthToken;

			//on load
			vm.$onInit = activate;

			return;

			////

			function activate(){
				return authenticationDataservice.isLoggedIn()
					.then(is_logged_in => {
						vm.is_logged_in = is_logged_in;
					})
					.then(() => { //if logged in, then get logged users info
						if ( vm.is_logged_in  ){
							return vm.getLoggedUserInfo();
						}
					})
					.then(() => {
						if ( vm.is_logged_in  ){ //if logged in, then connect to socket io
							return connectToVideoInterviewSocket(authenticationDataservice.getToken());
						}
					})
					.then(() => {
						vm.processing_is_logged_in = false;	
					})
					.catch(err => {
						vm.processing_is_logged_in = false;
						console.log('error', err);
					});
			}

			/**
			 * 
			 * @param {*} auth_token 
			 */
			function connectToVideoInterviewSocket(auth_token){
				return $q(function(resolve, reject) {
					vm.socket_io_connection = socketService.videoInterview(auth_token);

					//initialize event handlers
					vm.socket_io_connection.on('connect', vm.io_eventHandlers.onConnect);

					return resolve(vm.socket_io_connection);
				});
			}

			/**
			 * 
			 */
			function getLoggedUserInfo(){
				return authenticationDataservice.getLoggedUserInfo()
						.then(logged_user => {
							vm.logged_user_info = logged_user;
						});
			}

			 /**
			  * 
			  * @param {*} login_username 
			  */
			 function login(login_username, password){
				authenticationDataservice
					.login(login_username, password)
					.then(function(auth_token){

						//update logged users info
						vm.getLoggedUserInfo()
							.then(() => {
								vm.is_logged_in = true;
							});
					})
					.catch(function(err){
						console.log(err);
						alert(err.data);
					});
			 }

			 /**
			  * 
			  */
			 function logout(){
				return authenticationDataservice
					.logout()
					.then(()=>{
						vm.is_logged_in = false;
					});
			 }

			 /**
			  * 
			  */
			 function io_emit_updateUserByAuthToken(){
				var auth_token = authenticationDataservice.getToken();
				vm.socket_io_connection.emit('video-interview.update-logged-user-info-by-token', auth_token);
			 }
			 
			 /**
			  * 
			  * @param {*} a 
			  * @param {*} b 
			  * @param {*} c 
			  * @param {*} d 
			  */
			 function io_event_onConnect(a,b,c,d){
				console.log(a,b,c,d);
			 }
	}

})();