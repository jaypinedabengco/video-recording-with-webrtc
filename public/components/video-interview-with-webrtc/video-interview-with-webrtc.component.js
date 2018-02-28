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
			vm.users_list = [];
			vm.is_logged_in = false;
	
			vm.login = login;
			vm.logout = logout;

			//on load
			vm.$onInit = activate;

			return;

			////

			function activate(){
				vm.is_logged_in = authenticationDataservice.isLoggedIn();
				console.log('hey!', vm.is_logged_in);
			}

			 /**
			  * 
			  * @param {*} login_username 
			  */
			 function login(login_username, password){
				authenticationDataservice
					.login(login_username, password)
					.then(function(auth_token){
						vm.is_logged_in = true;
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
				authenticationDataservice
					.logout()
					.then(()=>{
						vm.is_logged_in = false;
					});
			 }
	}

})();