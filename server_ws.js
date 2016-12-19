var mongodb = require("mongodb");
var exphbs  = require('express-handlebars');
var MeshbluSocketIO = require('meshblu');

var express = require('express');
var app     = express();
var server = require('http').createServer(app);
var server  = app.listen(3300, function () {
  console.log('Server listening at port %d', 3300);
});
var io      = require('socket.io').listen(server);
var http = require('http');
var bodyParser = require('body-parser');

var UUID;
var TOKEN;

var meshblu = new MeshbluSocketIO({
  resolveSrv: false,
  hostname : '172.24.4.104',
  port: 3000,
  protocol : "ws",
  uuid: UUID,
  token: TOKEN
})

function getDataFromMeshblu(jsonResp) {
	console.log("getDataFromMeshblu");
  console.log("UUID: " + UUID);
  console.log("TOKEN: " + TOKEN);
  console.log("host: " + meshblu.hostname);
	meshblu.devices({'uuid':'163ebaeb-84db-4f57-ba8b-526e26e11ddf'}, function(result) {
    console.log(result);
		var options = {
			host: '172.24.4.104',
			port: 3000,
			path: '/data/'+ UUID,
			headers: {
				'meshblu_auth_uuid': UUID,
				'meshblu_auth_token': TOKEN,
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

      } catch (e) {
        console.log(e.message);
      }

      var dataset = [];
      for (var j = 0; j < result.devices[0].schema.length; j++) {
        console.log(result.devices);
        console.log(result.devices[0].schema);
        var waterVol = [];
        for (var i = parsedData.data.length - 1; i >= 0; i--) {
          var time = parsedData.data[i].timestamp;
          timestampArray.push({"label": time});
          if(parsedData.data[i].sensor_id != result.devices[0].schema[j].sensor_id)
            return;

         var value = parsedData.data[i].value;
         if (result.devices[0].schema[j].type_id == 65521) {
          var value = parsedData.data[i].value == 'true' ? 1 : 0;
          }
          waterVol.push({"value" : value});


        }
         dataset.push ({"seriesname" : result.devices[0].schema[j].name,"data" : waterVol});
       }
        var response = {"dataset" : dataset,"categories" : timestampArray};
      jsonResp.json(response);
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });//error
 });//http get
});//meshblu.devices
}

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get("/fuelPrices", function(req, res) {
  console.log("fuelPrices");
  if (UUID != undefined && TOKEN != undefined)
  	getDataFromMeshblu(res);
});

app.get("/", function(req, res) {
  console.log("index");
  //res.render("chart");
  res.render('credentials');
})

app.post("/", function(req, res) {
  UUID = req.body.uuid;
  TOKEN = req.body.token;
  meshblu.connect(function(error) {
    console.log('connect');
    if (error)
      console.log(error);
    meshblu.on('ready', function() {
      console.log('Ready to rock');
      res.render("chart");
    });
  });
});

meshblu.on('notReady', function(response) {
  console.error('notReady');
  console.error(JSON.stringify(response, null, 2));
});


io.on('connection', function(client) {
    console.log('Client connected...');
    client.emit('messages', 1);
});