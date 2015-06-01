var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

var user_inc = 0;
var online = {};
io.on('connection', function(socket) {
    console.log('a user connected');
    var id = user_inc++;
    var name = '';
    online[id] = '';
    socket.on('disconnect', function() {
        delete online[id];
        console.log('user disconnected');
    });
    socket.on('message sent', function(msg) {
        if (!name) {
            name = msg;
            online[id] = name;
            console.log('user ' + id + ' is named ' + name);
            io.emit('message', name + ' has connected');
        } else if (msg.lastIndexOf('/', 0) === 0) {
            if (msg.lastIndexOf('/online', 0) === 0) {
                var result = Object.keys(online).length + ' users online.';
                socket.emit('message', result);
            } else if (msg.lastIndexOf('/who', 0) === 0) {
                var usernames = new Array;
                Object.keys(online).forEach(function (key) {
                    var username = online[key];
                    if (username)
                        usernames.push(username);
                });
                var result = usernames.join([seperator=', ']);
                socket.emit('message', result);
            }
        } else {
            console.log(name + ': ' + msg);
            io.emit('message', name + ': ' + msg);
        }
    });
});

server.listen(app.get('port'), function() {
    console.log('Socket.io chat server is running on port', app.get('port'));
});
