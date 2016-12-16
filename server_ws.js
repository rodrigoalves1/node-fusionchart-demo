var mongodb = require("mongodb");
var exphbs  = require('express-handlebars');
var MeshbluSocketIO = require('meshblu');

var express = require('express');
var app     = express();
var server = require('http').createServer(app);
var server  = app.listen(3000, function () {
  console.log('Server listening at port %d', 3000);
});
var io      = require('socket.io').listen(server);
var http = require('http');

var meshblu = new MeshbluSocketIO({
  resolveSrv: false,
  hostname : '172.24.4.104',
  port: 3000,
  protocol : "ws",
  uuid: 'f2f3b3a6-1fce-4c40-8e6f-eadfd9670000',
  token: '792a826b813226b916568ac3a58a4aed95d0bc2a'
})

meshblu.on('ready', function() {
  console.log('Ready to rock');
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

getDevices = function() {
  var res;
  meshblu.devices({}, function(result){
    console.log('devices list');
    console.log(JSON.stringify(result.devices));
    res = result.devices;
  });

  return res;
}

function getDataFromMeshblu(jsonResp) {
  console.log("getDataFromMeshblu");
  var options = {
    host: '172.24.4.104',
    port: 3000,
    path: '/data/f2f3b3a6-1fce-4c40-8e6f-eadfd9670000',
    headers: {
          'meshblu_auth_uuid':'f2f3b3a6-1fce-4c40-8e6f-eadfd9670000',
          'meshblu_auth_token':'792a826b813226b916568ac3a58a4aed95d0bc2a',
          'Content-Type':'application/json'
    }
  };
    http.get(options, (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];
    var error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                       `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.log(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
      try {
        parsedData = JSON.parse(rawData);
        //console.log(parsedData.data);
        var timestampArray = [];
        var waterVol = [];
      } catch (e) {
        console.log(e.message);
      }
        for (var i = parsedData.data.length - 1; i >= 0; i--) {
        //category array
          var time = parsedData.data[i].timestamp;
          //series 1 values array
          var value = parsedData.data[i].value;

          timestampArray.push({"label": time});
          waterVol.push({"value" : value});

        var dataset = [
          {
            "seriesname" : "Water Volume",
            "data" : waterVol
          }
        ];
        var response = {
          "dataset" : dataset,
          "categories" : timestampArray
        };
        }
      jsonResp.json(response);
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
 });
}

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));

app.get("/fuelPrices", function(req, res) {
  console.log("fuelPrices");
  getDataFromMeshblu(res);
});

app.get("/", function(req, res) {
  console.log("index");
  res.render("chart");
})

io.on('connection', function(client) {
    console.log('Client connected...');
    client.emit('messages', 1);
});