require('dotenv').config()
var express = require('express');
var socket = require('socket.io');
const PORT = process.env.PORT_NUMBER;
// App setup
var app = express();
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
var token = true;
const fetchData=()=>{
    
}
emitter.on("token",()=>{
    console.log(token);
    token = !token
    console.log(token);
})
// Static files
app.use(express.static('public'));
function canEnter(id)
{
    if(token === true)
    {
        console.log("Token to given to process",id);
        return true;
    }
    else
    {
       return false;

    }
}

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
        while(!canEnter(socket.id));
        if(canEnter(socket.id) === true)
        {
            console.log("giving token");
            emitter.emit("token");
            socket.emit("TOKEN");
        }
    });
    socket.on("EXECUTE_CS",function(data){
        var vacci = data.vacci;
        var q = parseInt(data.quantity,10);
        console.log("Executing CS");
        setTimeout(()=>{console.log("Done")},5000);
        io.to(socket.id).emit("done");
    });
    socket.on("return_token",function(data){
       emitter.emit("token");
       io.to(socket.id).emit("result",{ result:"booked"});
    });
    

    socket.on("updated",function(data){
        socket.emit("data",{data : data});
    });

});