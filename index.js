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

const map = new Map(); 
var server = app.listen(PORT, function(){
    console.log(`http://localhost:${PORT}`);
});
var data = null;
var token = 1;
var queue = []

emitter.on("give token",()=>{
    
    fs.writeFileSync("token.txt", "0");
    token = fs.readFileSync("token.txt", "utf-8");
    // console.log("value changed to", token);
})

emitter.on("token recieved",()=>{
    fs.writeFileSync("token.txt", "1");
    token = fs.readFileSync("token.txt", "utf-8");
    // console.log("value changed to", token);

})

const getToken =()=>{
    return parseInt(fs.readFileSync("token.txt", "utf-8"));
}
// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);

io.on('connection', (socket) => {
    //console.log('made socket connection', socket.id);
    const count = io.engine.clientsCount;
    map.set(socket.id,count);
    console.log("Connected with Process ",count);
    
    
    //fetch initial data
    vData.find()
        .then((result)=>
        {
            data = result;
            console.log("Fetched data");
            socket.emit("data",data);
        })
        .catch((err)=>
        {
            console.log("err");
            console.log(err);
            return err;
        })
        

    socket.on("Book(TOKEN_REQUEST)",function(data){
        var x = getToken();
        // console.log("x = ",x);
        if(x !== 1)
        {
            console.log("Token not available");
            console.log("Process "+ map.get(socket.id) + " Pushed to queue");
            queue.push(socket.id);
            io.to(socket.id).emit("wait");
        }
        else
        {
            emitter.emit("give token");
            console.log("Token given to Process",map.get(socket.id));
            io.to(socket.id).emit("GIVE_TOKEN");
            // console.log("Token=",token);
        }
    });
    socket.on("EXECUTE_CS",function(data){
        var vacci = data.vacc;
        var q = parseInt(data.quantity,10);
        console.log("Process "+map.get(socket.id)+" Executing in CS");
        //CS
        console.log(typeof vacci);
        if(vacci === "p")
        {
            
            console.log("Entered here")
            vData.findOneAndUpdate({_id : "616bf50df53a9a9651d49fe1"},
                {$inc:{
                    "vaccine.pfizer" : -1
                }},{new:true})
                .exec()
                .then((result)=>{
                    console.log(result);
                    console.log("Booked Pfizer")})
                .catch((err)=>
                {
                    console.log(err);
                })
        }
        if(vacci === "j")
        {
            vData.findOneAndUpdate({_id : "616bf50df53a9a9651d49fe1"},
                {$inc:{
                    "vaccine.johnson and johnson" : -1
                }},{new:true})
                .exec()
                .then((result)=>{
                    console.log(result);
                    console.log("Booked Johnson and Johnson")})
                .catch((err)=>
                {
                    console.log(err);
                })

        }
        if(vacci === "covi")
        {
            vData.findOneAndUpdate({_id : "616bf50df53a9a9651d49fe1"},
                {$inc:{
                    "vaccine.covishield" : -1
                }},{new:true})
                .exec()
                .then((result)=>{
                    console.log(result);
                    console.log("Booked Covishield")})
                .catch((err)=>
                {
                    console.log(err);
                })

        }
        if(vacci === "covax")
        {
            vData.findOneAndUpdate({_id : "616bf50df53a9a9651d49fe1"},
                {$inc:{
                    "vaccine.covaxin" : -1
                }},{new:true})
                .exec()
                .then((result)=>{
                    // console.log(result);
                    console.log("Booked Covaxin")})
                .catch((err)=>
                {
                    console.log(err);
                })

        }
        
        setTimeout(()=>{
        console.log("Exiting CS")
        io.to(socket.id).emit("done");
    },5000);
        
        
    });
    socket.on("RETURN_TOKEN",function(data){
       emitter.emit("token recieved");
       console.log("Token returned by Process",map.get(socket.id));
       io.to(socket.id).emit("result",{ result:"booked"});
       if(queue.length != 0)
       {
           const s = queue.shift();
           io.to(s).emit("GIVE_TOKEN");
       }
    });
    

    socket.on("update",function(){
        vData.find()
        .then((result)=>
        {
            data = result;
            io.sockets.emit('data', data);
        })
        .catch((err)=>
        {
            console.log("err");
            console.log(err);
            return err;
        })
    });

});