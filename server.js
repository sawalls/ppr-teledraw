process.env.NODE_ENV = process.env.NODE_ENV || "development";

var express = require("./config/express");

var app = express();


var io = require("socket.io").listen(app.listen(3000));

require('./app/routes/index.server.routes.js')(app, io);

module.exports = app;

console.log("Server running at http://localhost:3000/");
