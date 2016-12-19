var mongodb = require("mongodb");
var exphbs  = require('express-handlebars');

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

function getDataFromMeshblu(jsonResp) {
	console.log("getDataFromMeshblu");
  console.log("UUID: " + UUID);
  console.log("TOKEN: " + TOKEN);
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
        var options1 = {
      host: '172.24.4.104',
      port: 3000,
      path: '/devices/'+ UUID,
      headers: {
        'meshblu_auth_uuid': UUID,
        'meshblu_auth_token': TOKEN,
        'Content-Type':'application/json'
      }
    };
    var result;
    http.get(options1, (res) => {
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
        result = JSON.parse(rawData);
        console.log(result);

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
        console.log(parsedData.data);
        var timestampArray = [];

      } catch (e) {
        console.log(e.message);
      }

      var dataset = [];
      for (var j = 0; j < result.devices[0].schema.length; j++) {
        console.log("SENSOR #" + j + "LEN: " + result.devices[0].schema.length);
        console.log(result.devices[0].schema[j]);
        var waterVol = [];
        for (var i = parsedData.data.length - 1; i >= 0; i--) {
          if (j == 0) {
            var time = parsedData.data[i].timestamp;
            timestampArray.push({"label": time});
          }
          if(parsedData.data[i].sensor_id == result.devices[0].schema[j].sensor_id) {

              var value = parsedData.data[i].value;
              if (result.devices[0].schema[j].type_id == 65521)
                  var value = parsedData.data[i].value == 'true' ? 1 : 0;

          for (var a =  0; a < timestampArray.length; a++) {
            if (timestampArray[a].label == parsedData.data[i].timestamp) {
              waterVol[a] = {"value" : value};
            }
  }
}
        }
         dataset.push ({"seriesname" : result.devices[0].schema[j].name,"data" : waterVol});
       }
        var response = {"dataset" : dataset,"categories" : timestampArray};
      jsonResp.json(response);
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });//error
 });//http get

      } catch (e) {
        console.log(e.message);
      }
      }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });//error
 });//http get


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
  res.render("chart");
});

io.on('connection', function(client) {
    console.log('Client connected...');
    client.emit('messages', 1);
});