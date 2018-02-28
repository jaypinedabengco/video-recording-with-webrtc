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
			'$scope', '$cookies',
			'app.recorded-videos.dataservice'
		];

		function ComponentController(
			$scope, $cookies, 
			recordedVideosDataservice
		) {

			var vm = this;

			vm.recorded_videos = [];

			vm.setSignedCookies = setSignedCookies;
			vm.updateRecordedVideoList = updateRecordedVideoList;
			vm.playVideo = playVideo;
			
			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){
				// var url = "https://d3buwf0gafsb59.cloudfront.net/transcoded_videos/sandbox/d5c30df3-cce5-4ddc-979b-91dd3ab328ba-1507765300622-recorded-video.webm/81234137-dacf-42b2-8684-a2168dd102fa-video.mpd";
				// var player = dashjs.MediaPlayer().create();
				// player.initialize(document.querySelector("#videoPlayer"), url, true);

				//set CF cookie first, to be able to view videos
				recordedVideosDataservice
					.getCFSignedURLCookies()
					.then(
						function(cf_cookies){
							vm.setSignedCookies(cf_cookies);
							updateRecordedVideoList();
						}
					)
			}

			/**
			 * 
			 */
			function updateRecordedVideoList(){
				return recordedVideosDataservice
					.getRecordedVideos()
					.then(
						function(result){
							vm.recorded_videos = result;
						}, 
						function(error){
							console.log('error', error);
						}
					);				
			}

			/**
			 * 
			 * @param {*} video_url 
			 */
			function playVideo(video_url){
				var player = dashjs.MediaPlayer().create();
				player.initialize(document.querySelector("#videoPlayer"), video_url, true);
			}

			/**
			 * 
			 * @param {*} cookies 
			 */
			function setSignedCookies(signed_cookies){
				
				var cookie_options = {
					secure : true
				};

				//set cookie to site
				for (var cookie_id in signed_cookies) {
					$cookies.put(cookie_id, signed_cookies[cookie_id], cookie_options);
				}
			}

		}		

})();