/**
 * 
 */
module.exports = function(namespace_name, io){

    var nsp = io.of(namespace_name);

    nsp.on('connection', function(socket){

        //variables
        var sample_user_id = Math.floor(Math.random() * 10000);
        var interval_container = null;

        socket.on('say-hello', onSayHello);
        socket.on('send-message', onSendMessage);
        socket.on('disconnect', onDisconnect);

        return initialize();

        //

        function initialize(){
            console.log('i connected to sample 01 namespace');

            //save on load
            socket.emit('on-connect', 'Welcome to sample 01');

            //interval to provider random numbers ( based on lynda tutorial );
            emitRandomIdIntervals();
        }

        /**
         * 
         */
        function emitRandomIdIntervals(){
            if ( !interval_container ){
                console.log('initializing interval');
                interval_container = setInterval(function(){
                    var random_numbers = Math.random();
                    console.log('emitting...', random_numbers);
                    socket.emit('create-random-numbers', random_numbers);
                }, 1000);
            }
        }

        /**
         * Client sent hello
         * @param {*} data 
         */
        function onSayHello(data){
            console.log('the client says hello', data);
            socket.emit('respond-to-hello', 'Hello to you too from sample 01');
        }

        /**
         * 
         * @param {*} data 
         */
        function onSendMessage(data){
            console.log('the client sent a message', data);
            socket.emit('respond-to-message', data);
            socket.broadcast.emit('respond-to-message', '[CLIENT_' + sample_user_id + '] : ' + data)
        }

        function onDisconnect(){
            console.log('disconnected');
            if ( interval_container ){
                clearInterval(interval_container);
            }
        }
    });



}