/**
 * SAMPLE connection websocket route handler
 */

module.exports = function(ws, req){

    const location = url.parse(req.url, true);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');    
    
}