'use strict';
(function(){
    
    angular
        .module('app.service.module')
        .factory('app.socket.service', Service);

    Service.$inject = ['socketFactory'];
    function Service(socketFactory){

        var access_urls = {
            video_interview : '/io/video_interview',
            simple_chat : '/io/simple_chat'
        };

        var services = {
            videoInterview : videoInterview, 
            connectToSimpleChat : connectToSimpleChat
        };
        
        return services;
        
        //////////

        /**
         * 
         */
        function videoInterview(auth_token){
            return socketFactory({
                ioSocket : io(access_urls.video_interview, {
                    query: 'auth_token=' + auth_token
                })
            });
        }


        /**
         * 
         * @param {*} username 
         * @param {*} password 
         */
        function connectToSimpleChat(){
            return socketFactory({ 
                ioSocket : io(access_urls.simple_chat)
            });                            
        }
      
    }

})();