var socketIO = require('socket.io'), 
    socketioJwt = require('socketio-jwt');

var conf = require('./configuration');


/**
 * ADD Documentation HERE
 */
module.exports = function(server){

    const io = socketIO(server);

    //set authentication
    

    //CORS..
    // io.origins((origin, callback) => {
    //     if (origin !== 'https://foo.example.com') {
    //       return callback('origin not allowed', false);
    //     }
    //     callback(null, true);
    // });

    //configure
    //CHECK ON HOW TO DO ON socket.io ver 2
    // io.configure(function(){
    //     io.enable('browser client minification');
    //     io.enable('browser client etag');
    //     io.set('log level', 1) //reduce logging
    //     io.set('transports', [
    //         'websocket', 
    //         'xhr-polling', 
    //         'jsonp-polling'
    //     ])
    // });    

    //initialize namespaces

    require('./io_namespaces/sample_01.io.namespace')('/io/sample_01', io);
    require('./io_namespaces/sample_02.io.namespace')('/io/sample_02', io);
    require('./io_namespaces/sample_webrtc_signal_server.io.namespace')('/io/signaling_server', io);
    require('./io_namespaces/tag_game.io.namespace')('/io/tag_game', io);
    require('./io_namespaces/simple_chat.namespace')('/io/simple_chat', io);
    
    return io;
}