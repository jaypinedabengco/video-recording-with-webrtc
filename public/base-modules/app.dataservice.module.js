'use strict';
(function(){
     angular
        .module('app.dataservice.module', [])
		.service('apiDataService', [ '$http', '$q', ApiDataService])
		;

	/**
	 * 
	 */
	function ApiDataService($http, $q){
		
		var services = {	
			post : post,
			get : get
		}

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
			var _options = {
				method : _method, 
				url : api_url,
				headers : {
					'Content-Type': 'application/json',
				}, 
				data : data
			};

			if ( auth_token )
				_options.headers['x-access-token'] = auth_token;

			var deffered = $q.defer();

			$http(_options).then(
				function(response){
					var _response_data = response.data;
					if ( _response_data.success ){
						deffered.resolve(_response_data);
					} else {
						deffered.reject(_response_data);							
					}	
				}, 
				function(response){
					var _response_data = response.data;
					deffered.reject(_response_data);
				}
			);

			return deffered.promise;
		}					
	};	     
    
})();