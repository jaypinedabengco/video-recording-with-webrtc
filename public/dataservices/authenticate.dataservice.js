'use strict';
(function(){

    angular
        .module('app.dataservice.module')
        .service('app.dataservice.authentication', DataService);

	/**
	 * 
	 */
    DataService.$inject = ['app.api.dataservice'];
	function DataService(apiDataService){

		var services = {	
			login
		}

		return services;

		/////

        /**
         * 
         * @param {*} api_url 
         * @param {*} data 
         * @param {*} auth_token 
         */
		function login(username, password){
            return apiDataService
                .post('/api/authenticate', {username : username, password : password})
                .then(function(result){
                    return result.data;
                });
		}

	};	     
    
})();