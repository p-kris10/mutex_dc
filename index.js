var express = require('express');

var app = express();

var server = app.listen(4000,()=>{
    console.log("Listening on port 4000");
})


//static files
app.use(express.static('public'));