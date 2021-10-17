require('dotenv').config()
var express = require('express');
var socket = require('socket.io');
const PORT = process.env.PORT_NUMBER;
// App setup
var app = express();
var server = app.listen(PORT, function(){
    console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    socket.on("add",function(data){
        var a = parseInt(data.n1,10);
        var b = parseInt(data.n2,10);
        var c = a+b;
        console.log(a+b);
        io.to(socket.id).emit("result",{ result:c});
    });

});