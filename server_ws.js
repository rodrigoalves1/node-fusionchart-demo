var express = require("express");
var mongodb = require("mongodb");
var exphbs  = require('express-handlebars');
var MeshbluSocketIO = require('meshblu');

var meshblu = new MeshbluSocketIO({
  resolveSrv: false,
  hostname : 'host',
  port: 3000,
  protocol : "ws",
  uuid: 'uuid',
  token: 'token'
})

meshblu.on('ready', function() {
  console.log('Ready to rock');
  meshblu.devices({}, function(result) {
    console.log('devices');
    console.log(JSON.stringify(result, null, 2));
  });
});

meshblu.on('notReady', function(response) {
  console.error('notReady');
  console.error(JSON.stringify(response, null, 2));
});


meshblu.connect(function(error) {
  console.log('connect');
  if (error)
    console.log(error);
});

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));

app.get("/fuelPrices", function(req, res){
  getDataFromMeshblu(res);
});

app.get("/", function(req, res){
  res.render("chart");
});

app.listen("3300", function(){
  console.log('Server up: http://localhost:3300');
});
