require('dotenv').config()
var express = require('express');
var socket = require('socket.io');
const PORT = process.env.PORT_NUMBER;
// App setup
var app = express();
var fs = require("fs");
const EventEmitter = require("events");
const emitter = new EventEmitter();
const vData  = require('./models/vaccine-data');
const mongoose = require('mongoose');

const dbURI = process.env.dbURI;
mongoose.connect(dbURI,{useNewUrlParser : true, useUnifiedTopology: true})
    .then((result)=> console.log('connected to db'))
    .catch((err)=>{console.log(err)});


var server = app.listen(PORT, function(){
    console.log(`http://localhost:${PORT}`);
});
var data = null;
var token = 1;
var queue = []

emitter.on("give token",()=>{
    
    fs.writeFileSync("token.txt", "0");
    token = fs.readFileSync("token.txt", "utf-8");
    console.log("Token given ");
    console.log("value changed to", token);
})

emitter.on("token recieved",()=>{
    fs.writeFileSync("token.txt", "1");
    token = fs.readFileSync("token.txt", "utf-8");
    console.log("Token returned ");
    console.log("value changed to", token);

})
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const getToken =()=>{
    return parseInt(fs.readFileSync("token.txt", "utf-8"));
}
// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    //fetch initial data
    vData.find()
        .then((result)=>
        {
            data = result;
            console.log("got data");
            socket.emit("data",data);
        })
        .catch((err)=>
        {
            console.log("err");
            console.log(err);
            return err;
        })
        

    socket.on("book",function(data){
        // console.log("Token == ",token);
        var x = getToken();
        console.log("x = ",x);
        if( x !== 1)
        {
            console.log("pushed to queue");
            queue.push(socket.id);
            io.to(socket.id).emit("wait");
        }
        else
        {
            emitter.emit("give token");
            io.to(socket.id).emit("TOKEN");
            // console.log("Token=",token);
        }
    });
    socket.on("EXECUTE_CS",function(data){
        var vacci = data.vacci;
        var q = parseInt(data.quantity,10);
        console.log("Executing CS",socket.id);
        setTimeout(()=>{
        console.log("Done")
        io.to(socket.id).emit("done");
    },10000);
        
        
    });
    socket.on("return_token",function(data){
       emitter.emit("token recieved");
       io.to(socket.id).emit("result",{ result:"booked"});
       if(queue.length != 0)
       {
           console.log("This happened");
           const s = queue.shift();
           token = 0;
           io.to(s).emit("TOKEN");
       }
    });
    

    socket.on("updated",function(data){
        socket.emit("data",{data : data});
    });

});