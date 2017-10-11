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
				var url = "https://studylane-transcoded-videos.s3-ap-southeast-1.amazonaws.com/transcoded_videos/sandbox/4e296b51-29b1-4734-87ff-4267dd2c22a51507711977403/e2011c32-8913-45c2-bb0b-0ae1c22b7525-video.mpd?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAINL3KWVNRCT4KV4Q/20171011/ap-southeast-1/s3/aws4_request&X-Amz-Date=20171011T085618Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=90c231829ccf5a7cee4026fa8bb41e86429a6642b066ed0e8155ab06a92f2095";
				var player = dashjs.MediaPlayer().create();
				player.initialize(document.querySelector("#videoPlayer"), url, true);

				// recordedVideosDataservice
				// 	.getRecordedVideos()
				// 	.then(
				// 		function(result){
				// 			vm.recorded_videos = result;
				// 		}, 
				// 		function(error){
				// 			console.log('error', error);
				// 		}
				// 	)
			}

		}		

})();