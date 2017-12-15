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
		function post(api_url, data){
			return doRequest(api_url, 'POST', data);			
		}

        /**
         * 
         * @param {*} api_url 
         * @param {*} auth_token 
         */
		function get(api_url){
			return doRequest(api_url, 'GET', {});
		}		

        /**
         * 
         * @param {*} api_url 
         * @param {*} method 
         * @param {*} data 
         * @param {*} auth_token 
         */
		function doRequest(api_url, method, data){

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

			return $http(_options).then(
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