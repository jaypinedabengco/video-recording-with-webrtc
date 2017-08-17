const WebSocket = require('ws');

module.exports = function(server){

    const wss = new WebSocket.Server({ server });

    ///

    wss.on('connection', require('./ws_routes/connection.ws.route'));

}