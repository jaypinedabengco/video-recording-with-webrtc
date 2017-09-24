/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name);
    
    //middleware ( get authentication token )
    // nsp.use((socket, next) => {
    //     let auth_token = socket.handshake.headers['x-auth-token'];
    //     console.log('auth_token', auth_token);
    //     if (auth_token) {
    //         return next();
    //     }
    //     return next(new Error('authentication error'));
    // });




    nsp.on('connection', function(socket){

        //variables;
        var channel_id;        
        
        //events
        socket.on('disconnect', onDisconnect);
        
        return initialize();

        ////

        /**
         * 
         */
        function initialize(){

            console.log('connected');
        }

        /**
         * 
         */
        function onDisconnect(){
            console.log('disconnected');
        }

        
    });

}