'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('sample', {
			templateUrl: 'components/sample/sample.component.html',
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
			vm.message = '';
			vm.random_number = null;
			vm.response_list = [];

			vm.io_sample_01 = sockerService.getSample01();

			//
			vm.sendMessage = sendMessage;

			//io event handlers
			vm.io_sample_01.on('respond-to-message', socketOnRespondToMessage);
			vm.io_sample_01.on('create-random-numbers', socketOnCreateRandomNumbers);

			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){

				// vm.io_sample_01.on('on-connect', function(message){
				// 	console.log('[sample_01]', message);
				// 	vm.io_sample_01.emit('say-hello', 'hi!');
				// });

				// vm.io_sample_01.on('respond-to-hello', function(message){
				// 	console.log('[sample_01]', message);
				// });
				
				// vm.io_sample_02.on('on-connect', function(message){
				// 	console.log('[sample_02]', message);
				// 	vm.io_sample_02.emit('say-hello', 'hellow !');
				// });

				// vm.io_sample_02.on('respond-to-hello', function(message){
				// 	console.log('[sample_02]', message);
				// });				

			}

			/**
			 * 
			 */
			function sendMessage(){
				if ( vm.message ){
					vm.io_sample_01.emit('send-message', vm.message);
					vm.message = '';
				}
			}

			/**
			 * 
			 * @param {*} content 
			 */
			function socketOnRespondToMessage(content){
				vm.response_list.push(content);
			}

			/**
			 * 
			 * @param {*} content 
			 */
			function socketOnCreateRandomNumbers(content){
				vm.random_number = content;
			}



		}		

})();