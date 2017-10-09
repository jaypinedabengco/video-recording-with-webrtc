'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('recordedVideosList', {
			templateUrl: 'components/recorded-videos-list/recorded-videos-list.component.html',
			controller: ComponentController
		});

		/////

		ComponentController.$inject = [
			'$scope', 'app.recorded-videos.dataservice'
		];

		function ComponentController(
			$scope, recordedVideosDataservice
		) {

			var vm = this;

			vm.recorded_videos = [];
			
			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){
				recordedVideosDataservice
					.getRecordedVideos()
					.then(
						function(result){
							vm.recorded_videos = result;
						}, 
						function(error){
							console.log('error', error);
						}
					)
			}

		}		

})();