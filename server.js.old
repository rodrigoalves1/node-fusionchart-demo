
var express = require("express");
var mongodb = require("mongodb");
var exphbs  = require('express-handlebars');
var http = require('http');

var dbObject;
var dbHost = "mongodb://localhost:27017/fusion_demo";
var MongoClient = mongodb.MongoClient;
MongoClient.connect(dbHost, function(err, db){
  if ( err ) throw err;
  dbObject = db;
});

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

function getDataFromMeshblu(jsonResp) {
  console.log("getDataFromMeshblu");
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

function getData(responseObj) {
  console.log("getData");
  dbObject.collection("fuel_price").find({}).toArray(function(err, docs) {
    if ( err ) throw err;
    var monthArray = [];
    var petrolPrices = [];
    var dieselPrices = [];

    for ( index in docs){
      var doc = docs[index];
      //category array
      var month = doc['month'];
      //series 1 values array
      var petrol = doc['petrol'];
      //series 2 values array
      var diesel = doc['diesel'];
      monthArray.push({"label": month});
      petrolPrices.push({"value" : petrol});
      dieselPrices.push({"value" : diesel});
    }

    var dataset = [
      {
        "seriesname" : "Petrol Price",
        "data" : petrolPrices
      },
      {
        "seriesname" : "Diesel Price",
        "data": dieselPrices
      }
    ];

    var response = {
      "dataset" : dataset,
      "categories" : monthArray
    };
    responseObj.json(response);
  });
}


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
