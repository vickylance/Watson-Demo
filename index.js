var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var watson = require('watson-developer-cloud');
var path = require('path');
var request = require('request');

// console.log(". = %s", path.resolve("."));
// console.log("__dirname = %s", path.resolve(__dirname));

// var conversation = watson.conversation({
//     username: process.env.USERNAME,
//     password: process.env.PASSWORD,
//     version: 'v1',
//     version_date: '2016-09-20'
// });

var conversation = watson.conversation({
    username: 'a5e6bf71-284f-4bcf-8f65-47c67d72a789',
    password: 'JYQV1pPXwFl7',
    version: 'v1',
    version_date: '2016-09-20'
});

// Replace with the context obtained from the initial request
var context = {};

function sendWatsonMsg(message, callback) {
    conversation.message({
        // workspace_id: process.env.WORKSPACE,
        workspace_id: 'e36eca52-0b97-4673-b1e8-8468d4b6373a',
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
                }
            }
            io.emit('bot msg', JSON.stringify(response.output.text.join(), null, 2));
            // io.emit('bot msg', JSON.stringify(context));
        }
    });
}

var pat = path.resolve(__dirname);

app.use('/public', express.static('public'));
// http.use(app.static(__dirname + '/public/'));
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
            getWeatherText();
            io.emit('bot msg', 'The climate is currently ' + weatherText);
            break;
        default:
            console.log('No action as ' + action + ' was found.');
            break;
    }
}

function getLocation() {
    io.emit('get location');
}

function getLocationKey(lat, long) {
    console.log('getting location key');
    locationId = request.get('http://api.accuweather.com/locations/v1/cities/geoposition/search.json?q=' + lat + ',' + long + '&apikey=' + 'A2ZsFc5m1XsTWlN2SuRGbX2EVaj6cxjL')
        .on('error', function (err) {
            console.log('err: ' + err);
        })
        .on('response', function (response) {
            console.log('response: ' + JSON.stringify(response));
            return response.Key;
        });
}


function getWeatherText() {
    weatherText = request.get('http://api.accuweather.com/currentconditions/v1/' + locationId + '.json?apikey=' + 'A2ZsFc5m1XsTWlN2SuRGbX2EVaj6cxjL')
        .on('error', function (err) {
            console.log('err1: ' + err);
        })
        .on('response', function (response) {
            console.log('response1: ' + JSON.stringify(response));
            return response.WeatherText;
        });
}

// http://api.accuweather.com/locations/v1/cities/geoposition/search.json?q=40.59,-73.58&apikey={your key}
// http://apidev.accuweather.com/locations/v1/search?q=chennai&apikey={your key}
// http://api.accuweather.com/forecasts/v1/hourly/1hour/335315?apikey={your key}