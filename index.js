var express = require('express');
var session = require('express-session');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var watson = require('watson-developer-cloud');
var path = require('path');
var request = require('request');

// console.log(". = %s", path.resolve("."));
// console.log("__dirname = %s", path.resolve(__dirname));

var conversation = watson.conversation({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    version: 'v1',
    version_date: '2016-09-20'
});

// Replace with the context obtained from the initial request
var context = {};

function sendWatsonMsg(message, callback) {
    conversation.message({
        workspace_id: process.env.WORKSPACE,
        input: {
            'text': message
        },
        context: context
    }, function (err, response) {
        if (err) {
            console.log('context: ' + JSON.stringify(context));
            console.log('error:', err);
        } else {
            context = response.context;
            if (typeof callback === "function") {
                if (response.output.action !== null && response.output.action !== undefined && response.output.action !== '') {
                    callback(response.output.action);
                } else {
                    io.emit('bot msg', JSON.stringify(response.output.text.join(), null, 2));
                    // io.emit('bot msg', JSON.stringify(context));
                }
            }
        }
    });
}

var pat = path.resolve(__dirname);

app.use('/public', express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(pat + '/public/index.html');
});

io.on('connection', function (socket) {
    console.log('a user is connected');
    socket.on('user msg', function (msg) {
        console.log('message: ' + msg);
        // io.emit('user msg', msg);
        sendWatsonMsg(msg, executeAction);
    });
    socket.on('disconnect', function () {
        console.log('a user is disconnected');
    });
    socket.on('send location', function (position) {
        console.log("send location received. pos: " + JSON.stringify(position));
        getLocationKey(position.lat, position.long);
    });
});

// http.listen(process.env.port || process.env.PORT || 3978, function () {
//     console.log("Connected");
// });

http.listen(3000, function () {
    console.log("Connected");
});

var weatherText;
var locationId;

function executeAction(action) {

    // action:{
    //     name: "climate"
    // }

    console.log("action: " + JSON.stringify(action));

    switch (action.name) {
        case "climate":
            console.log('executing the climate');
            getLocation();
            break;
        default:
            console.log('No action as ' + action + ' was found.');
            break;
    }
}

function getLocation() {
    io.emit('get location');
    console.log('emiting get location');
}

function getLocationKey(lat, long) {
    console.log('getting location key for lat: ' + lat + ' and long: ' + long);
    request('http://apidev.accuweather.com/locations/v1/cities/geoposition/search.json?q=' + lat + ',' + long + '&apikey=' + process.env.ACCUWEATHER, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            locationId = JSON.parse(body).Key;
            console.log('location id: ' + locationId);
            getWeatherText();
        }
    });
}

function getWeatherText() {
    console.log('http://apidev.accuweather.com/currentconditions/v1/' + locationId + '.json?apikey=' + process.env.ACCUWEATHER);
    request('http://apidev.accuweather.com/currentconditions/v1/' + locationId + '.json?apikey=' + process.env.ACCUWEATHER, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('weathertext = ' + JSON.stringify(JSON.parse(body)[0].WeatherText));
            weatherText = JSON.parse(body)[0].WeatherText;
            io.emit('bot msg', 'The climate is currently ' + weatherText);
        }
    });
}

// http://api.accuweather.com/locations/v1/cities/geoposition/search.json?q=40.59,-73.58&apikey={your key}
// http://apidev.accuweather.com/locations/v1/search?q=chennai&apikey={your key}
// http://api.accuweather.com/forecasts/v1/hourly/1hour/335315?apikey={your key}