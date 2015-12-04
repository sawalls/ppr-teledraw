process.env.NODE_ENV = process.env.NODE_ENV || "development";

var express = require("./config/express"),
    Server = require("http").Server,
    session = require("express-session");

var express_results = express();
var app = express_results[0];
var io = express_results[1];
var server = Server(app);

require('./app/routes/index.server.routes.js')(app, io);

module.exports = app;

console.log("Server running at http://localhost:3000/");
