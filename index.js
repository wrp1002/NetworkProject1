var express = require('express');
var bodyParser = require("body-parser");

var controller = require('./controllers/controller.js');
var app = express();
var port = process.env.PORT || 8080;


app.set('view engine', 'ejs');

app.use(express.json());

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')
    // // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow ,
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-ControlAllow-Headers');
    // Pass to next layer of middleware
    next();
});

app.use(express.static('./public'));

controller(app);

app.listen(port, function () {
    console.log('Example app listening on port 8080!');
});