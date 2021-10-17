const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const vDataSchema = new Schema({
    name : {
        type : String,
        required : true,
    },
    location : {
            type : String,
            required : true
    },
    admin : {
        type : String, 
        required : true
    },
    vaccine :{
        "covishield":{
            type : Number,
            required : true
        },
        "johnson and johnson":{
            type : Number,
            required : true
        },
        "covaxin":{
            type : Number,
            required : true
        },
        "pfizer":{
            type : Number,
            required : true
        }
    } 
},{timestamps : true});

const vData = mongoose.model('VaccineData',vDataSchema);

module.exports = vData;