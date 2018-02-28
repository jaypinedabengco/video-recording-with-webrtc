(function(){
'use strict';

    angular
        .module('app.dataservice.module')
        .service('app.dataservice.video-interview-authentication', DataService);

	/**
	 * 
	 */
    DataService.$inject = ['app.api.dataservice', 'app.dataservice.persistent-storage-manager', '$q'];
	function DataService(apiDataService, persistentStorageManager, $q){

        var token_cookie_storage_key = 'video-interview:login-key';

        var private_services = {
            getToken : getToken
        };

		var services = {	
            login : login, 
            getToken : getToken, 
            isLoggedIn : isLoggedIn, 
            logout : logout
		};

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
                .post('/api/video-interview/authenticate', {username : username, password : password})
                .then(function(result){

                    //save to persistent storage
                    var token = result.data;
                    persistentStorageManager.setCookie(token_cookie_storage_key, token, 1);

                    return token; //token
                });
        }

        /**
         * 
         */
        function logout(){
            return $q(function(resolve, reject) {
                persistentStorageManager.removeCookie(token_cookie_storage_key);
                return resolve();
              });            
        }

        /**
         * 
         */
        function isLoggedIn(){
            return !!persistentStorageManager.getCookie(token_cookie_storage_key);
        }
        
        /**
         * 
         */
        function getToken(){
            return persistentStorageManager.getCookie(token_cookie_storage_key);
        }
	} 
    
})();