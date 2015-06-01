var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

var users = 0;
io.on('connection', function(socket) {
    console.log('a user connected');
    var id = users++;
    var name = '';
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    socket.on('message sent', function(msg) {
        if (!name) {
            name = msg;
            console.log('user ' + id + ' is named ' + name);
            io.emit('message received', name + ' has connected');
        } else {
            console.log(name + ': ' + msg);
            io.emit('message received', name + ': ' + msg);
        }
    });
});

server.listen(app.get('port'), function() {
    console.log('Socket.io chat server is running on port', app.get('port'));
});
