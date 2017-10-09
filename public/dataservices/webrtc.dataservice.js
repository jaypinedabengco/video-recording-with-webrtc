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
			getRecordedVideos : getRecordedVideos
		}

		return services;

		/////

        /**
         * 
         * @param {*} api_url 
         * @param {*} data 
         * @param {*} auth_token 
         */
		function getRecordedVideos(){
            return apiDataService
                .get('/api/get-recorded-videos')
                .then(function(result){
                    return result.data;
                });
		}

	};	     
    
})();