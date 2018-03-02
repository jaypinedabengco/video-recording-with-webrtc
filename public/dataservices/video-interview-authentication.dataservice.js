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
        var token_cache_logged_user_info_key = 'video-interview:logged-user';

        var private_services = {
            getToken : getToken
        };

		var services = {	
            login : login, 
            getToken : getToken, 
            isLoggedIn : isLoggedIn, 
            logout : logout, 
            getLoggedUserInfo : getLoggedUserInfo
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
                .then(result => {
                    //save to persistent storage
                    var token = result.data;
                    persistentStorageManager.setCookie(token_cookie_storage_key, token, 1);
                    persistentStorageManager.removeVariableCache(token_cache_logged_user_info_key);
                    return token; //token
                });
        }

        /**
         * 
         */
        function logout(){
            return $q(function(resolve, reject) {
                persistentStorageManager.removeCookie(token_cookie_storage_key); //remove token
                persistentStorageManager.removeVariableCache(token_cache_logged_user_info_key);
                return resolve();
              });            
        }

        /**
         * 
         */
        function isLoggedIn(){

            return $q(function(resolve, reject) {

                //possible validation of token here...
                let auth_token = private_services.getToken();
                if (!auth_token){
                    return resolve(false);
                }

                return apiDataService
                    .post('/api/video-interview/validate-token', {}, auth_token)
                    .then(() => {
                        return resolve(true);
                    })
                    .catch(() => {
                        persistentStorageManager.removeCookie(token_cookie_storage_key); //remove token
                        return resolve(false);
                    });
                
            });
        }

        /**
         * 
         */
        function getLoggedUserInfo(){
            return $q(function(resolve, reject) {

                //possible validation of token here...
                let auth_token = private_services.getToken();
                if (!auth_token){
                    return reject('not logged in');
                }

                let cached_logged_user = persistentStorageManager.getVariableCache(token_cache_logged_user_info_key);

                if ( cached_logged_user ){
                    return resolve(cached_logged_user);
                }

                return apiDataService
                    .post('/api/video-interview/get-logged-user-info', {}, auth_token)
                    .then((result) => {
                        let logged_user = result.data;
                        persistentStorageManager.setVariableCache(token_cache_logged_user_info_key, logged_user);
                        return resolve(logged_user);
                    })
                    .catch(err => {
                        persistentStorageManager.removeCookie(token_cookie_storage_key); //remove token
                        return reject(err.message);
                    });
            });            
        }
        
        /**
         * 
         */
        function getToken(){
            return persistentStorageManager.getCookie(token_cookie_storage_key);
        }
	} 
    
})();