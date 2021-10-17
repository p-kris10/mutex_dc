require('dotenv').config()
var express = require('express');
var socket = require('socket.io');
const PORT = process.env.PORT_NUMBER;
// App setup
var app = express();
const vData  = require('./models/vaccine-data');
const mongoose = require('mongoose');

const dbURI = process.env.dbURI;
mongoose.connect(dbURI,{useNewUrlParser : true, useUnifiedTopology: true})
    .then((result)=> console.log('connected to db'))
    .catch((err)=>{console.log(err)});


var server = app.listen(PORT, function(){
    console.log(`http://localhost:${PORT}`);
});

// const newData = new vData({
//     "name":"RL Raheja Hospital",
//     "location":"Bandra",
//     "admin":"Dr.Gaurav Parulekar",
//     "vaccine":{
//       "covishield":250,
//       "covaxin":100,
//       "pfizer":30,
//       "johnson and johnson":60
//     }
//   });

// newData.save()
//     .then((result)=>{
//        console.log(result);
//     })
//     .catch((err)=>{
//         console.log(err);
//     })

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