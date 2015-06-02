var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

var users = {};
var user_inc = 0;
io.on('connection', function(socket) {
    var id = user_inc++;
    user_connected(socket, id);
    socket.on('setname', function(name) {
        user_setname(socket, id, name);
    });
    socket.on('message', function(msg) {
        user_message(socket, id, msg);
    });
    socket.on('command', function(cmd) {
        user_command(socket, id, cmd);
    });
    socket.on('disconnect', function() {
        user_disconnected(socket, id);
    });
});

function user_connected(socket, id) {
    if (!users[id]) users[id] = {};
    if (hasName(id)) {
        socket.emit('name', getName(id));
        welcomeUser(id);
    }
    else console.log('a user connected');
};

function user_setname(socket, id, name) {
    var oldName = getNameStr(id);
    setName(id, name);
    var newName = getNameStr(id);
    if (isOnline(id)) {
        var output = oldName + ' is now ' + newName;
        console.log(output);
        io.emit('message', output);
    } else {
        welcomeUser(id);
    }
};

function user_message(socket, id, msg) {
    var output = getNameStr(id) + ': ' + msg;
    console.log(output);
    io.emit('message', output);
};

function user_command(socket, id, cmd) {
    var command = cmd.substr(0, cmd.indexOf(' ')) || cmd;
    var argument = cmd.substr(cmd.indexOf(' ')+1, cmd.length) || '';
    if(Object.keys(cmds).indexOf(command) !== -1)
        cmds[command](socket, id, argument);
};

function user_disconnected(socket, id) {
    var output = getNameStr(id) + ' disconnected';
    users[id]['online'] = false;
    if (isOnline(id)) {
        io.emit('message', output);
    }
    console.log(output);
};

function welcomeUser(id) {
    var output = getNameStr(id) + ' connected.';
    users[id]['online'] = true;
    console.log(output);
    io.emit('message', output);
};

function hasName(id) {
    return getName(id) ? true : false;
};

function getNameStr(id) {
    return getName(id) || 'user ' + id;
};

function getName(id) {
    return users[id] ? users[id]['name'] : undefined;
};

function setName(id, name) {
    if (!users[id]) users[id] = {};
    users[id]['name'] = name;
};

function isOnline(id) {
    return users[id] ? users[id]['online'] : false;
};

var cmd_online = function(socket) {
    var online = [];
    for(var id in users)
        if(isOnline(id))
            online.push(getName(id));
    socket.emit('message', online.join([seperator=', ']));
};

var cmd_who = function(socket) {
    var count = 0;
    for(var id in users)
        if(isOnline(id))
            count++;
    socket.emit('message', count + ' users online.');
};

var cmd_nick = function(socket, id, name) {
    user_setname(socket, id, name);
};

var cmd_me = function(socket, id, msg) {
    var output = getName(id) + ' ' + msg;
    console.log(output);
    io.emit('message', output);
};

var cmds = {
    'online': cmd_online,
    'who': cmd_who,
    'nick': cmd_nick,
    'me': cmd_me
};

server.listen(app.get('port'), function() {
    console.log('Socket.io chat server is running on port', app.get('port'));
});
