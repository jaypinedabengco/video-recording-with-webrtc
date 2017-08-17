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