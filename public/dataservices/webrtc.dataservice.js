'use strict';
(function(){

    angular
        .module('app.dataservice.module')
        .service('app.recorded-videos.dataservice', DataService);

	/**
	 * 
	 */
    DataService.$inject = ['app.api.dataservice'];
	function DataService(apiDataService){

		var services = {	
            getRecordedVideos : getRecordedVideos,
            getCFSignedURLCookies : getCFSignedURLCookies
		}

		return services;

		/////

        /**
         * 
         */
		function getRecordedVideos(){
            return apiDataService
                .get('/api/get-recorded-videos')
                .then(function(result){
                    return result.data;
                });
        }
        
        /**
         * 
         */
        function getCFSignedURLCookies(){
            return apiDataService
                .get('/api/get-cf-signed-cookies')
                .then(function(result){
                    return result.data;
                });            
        }

	};	     
    
})();