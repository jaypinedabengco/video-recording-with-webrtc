'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('recorded-videos-list', {
			templateUrl: 'components/recorded-videos-list/recorded-videos-list.component.html',
			controller: ComponentController
		});

		/////

		ComponentController.$inject = [
			'$scope'
		];

		function ComponentController(
			$scope
		) {

			var vm = this;
			
			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){

	
			}

		}		

})();