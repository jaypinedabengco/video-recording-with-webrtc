/**
 * 
 */
module.exports = function(namespace_name, io){
    
    var nsp = io.of(namespace_name);

    nsp.on('connection', function(socket){

        socket.on('say-hello', onSayHello);
        
        return initialize();

        //

        function initialize(){
            console.log('i connected to sample 02 namespace');

            //save on load
            socket.emit('on-connect', 'Welcome to sample 02');
        }

        function onSayHello(data){
            console.log('the client says hello', data);
            socket.emit('respond-to-hello', 'Hello to you too from sample 02');
        }

    });

}