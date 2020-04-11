const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req,callback) =>{
    var corsOptions;
    if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = {origin: true}
    }
    else{
        corsOptions = {origin: false}
    }
    callback(null, corsOptions)
}

exports.cors = cors(); //it will accept * in the paranthesis which is mostly used in get request
exports.corsWithOptions = cors(corsOptionsDelegate);