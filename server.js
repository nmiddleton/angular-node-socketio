/**
 * Created by u8013621 on 31/10/2014.
 */

var http = require('http'),
    fs   = require('fs'),
    io   = require('socket.io').listen(8889); // for npm, otherwise use require('./path/to/socket.io')

// Reducing socket.io log (debug) statements
io.set('log level', 2);

// Sets up the web page on the web server and listens on port 8888
http.createServer(
    // Add a function that is automatically added to the 'request' event
    function (request, response) {
    fs.readFile(__dirname+'/public/index.html', function (err, data) {
        if (err) throw err;
        response.setHeader("Content-Type", "text/html");
        response.end(data);
    });
}).listen(8888);

function setProp(obj, path, value){
    var lastObj = obj;
    var property;
    path.split('.').forEach(function(name){
        if (name) {
            lastObj = obj;
            obj = obj[property=name];
            if (!obj) {
                lastObj[property] = obj = {};
            }
        }
    });
    lastObj[property] = value;
}
var model = {};
var clients = [];

// socket.io
io.sockets.on('connection', function(socket){
    clients.push(socket);
    // new client is here!
    socket.on('channel', function(msg){
        // This client  wrote something!
        console.log('message:');
        console.log('PATH:',msg.path);
        console.log('VAL:',msg.value);
        // e.g.
        // message:
        // { path: 'html', value: '<h1>Event Emitter' }
        // message:
        //{ path: 'name.first', value: 'Nei' }
        // message:
        //{ path: 'name.first', value: 'Neil' }
        // message:
        //{ path: 'name.last', value: 'Middlet' }
        // message:
        // { path: 'name.last', value: 'Middleto' }
        // message:
        // { path: 'name.last', value: 'Middleton' }

        // if the model object already has the property, update it. Otherwise, let angular create it in the scope.

        setProp(model, msg.path, msg.value);

        // EMIT this individual change to all the connected clients via the socket. They will receive it via angualr watching emits and updating scope
        clients.forEach(function(otherClient){
            if (socket !== otherClient){
                console.log("emitting..");
                otherClient.emit("channel", msg);
            }
        });
        console.log(msg);
    });
    // I've heard nothing on the channel yet, get the whole lot
    socket.emit("channel", {path:'', value:model});

});