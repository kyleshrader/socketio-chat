var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
