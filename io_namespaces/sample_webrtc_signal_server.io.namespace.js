/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name);
    
    nsp.on('connection', function(socket){

        //variables;
        var socket_id = socket.id;
        
        //events
        socket.on('disconnect', onDisconnect);
        
        return onConnect();

        ////

        /**
         * 
         */
        function onConnect(){
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