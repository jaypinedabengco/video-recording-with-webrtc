(function(){
'use strict';

    angular
        .module('app.dataservice.module')
        .service('app.api.dataservice', ApiDataService);

	/**
	 * 
	 */
    ApiDataService.$inject = ['$http', '$q'];
	function ApiDataService($http, $q){

		var services = {	
			post : post,
			get : get
		};

		return services;

		/////

        /**
         * 
         * @param {*} api_url 
         * @param {*} data 
         * @param {*} auth_token 
         */
		function post(api_url, data, auth_token){
			return doRequest(api_url, 'POST', data, auth_token);			
		}

        /**
         * 
         * @param {*} api_url 
         * @param {*} auth_token 
         */
		function get(api_url, auth_token){
			return doRequest(api_url, 'GET', {}, auth_token);
		}		

        /**
         * 
         * @param {*} api_url 
         * @param {*} method 
         * @param {*} data 
         * @param {*} auth_token 
         */
		function doRequest(api_url, method, data, auth_token){

			var _method = (method && method.toLowerCase() == 'post')?'POST':'GET';

            //build options
			var options = {
				method : _method, 
				url : api_url,
				headers : {
					'Content-Type': 'application/json',
				}, 
				data : data
			};			

			if ( !!auth_token ){
				options.headers['x-access-token'] = auth_token;
			}

			return $http(options).then(
				function(response){
					var response_data = response.data;
					if ( !response_data.success ){
                        return $q.reject(response_data);							
					}	
                    return response_data;
                })
                .catch(function(error){
                    return $q.reject(error.data);
                });
		}	
	}
    
})();