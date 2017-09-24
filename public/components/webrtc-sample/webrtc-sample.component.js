'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('webrtcSample', {
			templateUrl: 'components/webrtc-sample/webrtc-sample.component.html',
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

			//variables
			vm.io_signaling_server = sockerService.getSignalingServer();
			
			//functions
			vm.reconnect = reconnect;


            //socket events
            vm.io_signaling_server.on('connect', socketOnConnect);
            vm.io_signaling_server.on('disconnect', socketOnDisconnect);

			
			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){
            }
            
            /**
             * 
             * @param {*} message 
             */
            function socketOnConnect(data){
                console.log('i have connected', data);
            }

            /**
             * 
             * @param {*} data 
             */
            function socketOnDisconnect(data){
                console.log('i have disconnected', data);
			}
			
			/**
			 * 
			 */
			function reconnect(){
				var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InJhbmRvbS1pZC0yOTMxIiwidXNlcm5hbWUiOiJqb2huZG9lIiwiaWF0IjoxNTA1NzA3NjQ4LCJleHAiOjE1MDU3MTEyNDh9.F57rWeBRHK6kO5_bf5RcsQ15uLISdSobLpGV_rgj15Q';
				vm.io_signaling_server = sockerService.getSignalingServer(token);
			}

		}		

})();