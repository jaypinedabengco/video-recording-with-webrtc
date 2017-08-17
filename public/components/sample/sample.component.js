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

			vm.io_sample_01 = sockerService.getSample01();
			vm.io_sample_02 = sockerService.getSample02();

			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){

				vm.io_sample_01.on('on-connect', function(message){
					console.log('[sample_01]', message);
					vm.io_sample_01.emit('say-hello', 'hi!');
				});

				vm.io_sample_01.on('respond-to-hello', function(message){
					console.log('[sample_01]', message);
				});
				
				vm.io_sample_02.on('on-connect', function(message){
					console.log('[sample_02]', message);
					vm.io_sample_02.emit('say-hello', 'hellow !');
				});

				vm.io_sample_02.on('respond-to-hello', function(message){
					console.log('[sample_02]', message);
				});				

			}

		}		

})();