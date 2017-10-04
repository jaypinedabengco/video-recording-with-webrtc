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
            signaling_server : '/io/signaling_server',
            tag_game : '/io/tag_game', 
            simple_chat : '/io/simple_chat'
        }

        var services = {
            getSample01 : getSample01, 
            getSample02 : getSample02, 
            getSignalingServer : getSignalingServer, 
            getTagGame : getTagGame, 
            connectToSimpleChat : connectToSimpleChat
        }
        
        return services;
        
        //////////

        /**
         * 
         */                    
        function getSample01(){
            return socketFactory({ 
                ioSocket : io(access_urls.sample_01)
            });
        }

        /**
         * 
         */
        function getSample02(){
            return socketFactory({ 
                ioSocket : io(access_urls.sample_02)
            });            
        }

        /**
         * 
         */
        function getSignalingServer(auth_token){
            return socketFactory({ 
                ioSocket : io(access_urls.signaling_server, {
                    query: 'auth_token=' + auth_token
                })
            });
        }

        /**
         * 
         */
        function getTagGame(){
            return socketFactory({ 
                ioSocket : io(access_urls.tag_game)
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