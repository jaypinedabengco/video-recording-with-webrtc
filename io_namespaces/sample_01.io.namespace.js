/**
 * SAMPLE connection io namespace
 */
module.exports = function(io){

    io.on('connection', function(client){

        client.on('say-hello', onSayHello);

        return initialize();

        //

        function initialize(){
            console.log('i connected to sample 01 namespace');

            //save on load
            client.emit('on-connect', 'Welcome to sample 01');
        }

        function onSayHello(data){
            console.log('the client says hello', data);
            client.emit('respond-to-hello', 'Hello to you too from sample 01');
        }
    });

}