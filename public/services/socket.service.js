'use strict';
(function(){
    
    angular
        .module('app.service.module')
        .factory('app.socket.service', Service);

    Service.$inject = ['socketFactory'];
    function Service(socketFactory){

        var access_urls = {
            sample_01 : "/io/sample_01", 
            sample_02 : "/io/sample_02", 
        }

        var cached_sockets = {
            sample_01 : null, 
            sample_02 : null
        }

        var services = {
            getSample01 : getSample01, 
            getSample02 : getSample02
        }
        
        return services;
        
        //////////

        /**
         * 
         */                    
        function getSample01(){

            //if cached
            if ( cached_sockets.sample_01 ){
                return cached_sockets.sample_01;
            }

            //set connection
            cached_sockets.sample_01 = socketFactory({
                ioSocket: io.connect(access_urls.sample_01)
            });

            return cached_sockets.sample_01;
        }

        /**
         * 
         */
        function getSample02(){

            //if cached
            if ( cached_sockets.sample_02 ){
                return cached_sockets.sample_02;
            }

            //set connection
            cached_sockets.sample_02 = socketFactory({
                ioSocket: io.connect(access_urls.sample_02)
            });

            return cached_sockets.sample_02;
        }
      
    }

})();