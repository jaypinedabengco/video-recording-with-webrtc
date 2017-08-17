const socketIO = require('socket.io');

module.exports = function(server){

    const io = socketIO(server);

    //initialize namespaces
    const sample_namespace_01 = require('./io_namespaces/sample_01.io.namespace')(io.of('/io/sample_01'));
    const sample_namespace_02 = require('./io_namespaces/sample_02.io.namespace')(io.of('/io/sample_02'));

    ///

    //all
    // io.on('connection', require('./routes_io/connection.ws.route'));
    ///
    
    return io;

}