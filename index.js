/**
 * Created by bhalker on 20/12/16.
 */
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Converter = require("csvtojson").Converter;
var request = require("request");
var converter = new Converter({});
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

var end;

app.get('/convert/csv/to/json', function(req, res){
    var arr = [];
    var remoteCSVURL, query;

    //convert stream of csv files in JSON format
    converter.on("record_parsed", function (jsonObj) {
        arr.push(jsonObj);
    });

    // Indicates that the csv to json conversion is done
    converter.on("end_parsed",function(jsonObj){
        console.log("File converted successfully");
        end = true;
    });


    query = req.query;
    console.log("Got Query as", query.q);
    if(query.q){
        remoteCSVURL = query.q;
        request.get(remoteCSVURL).pipe(converter);
        io.on('connection', function(socket){
            console.log('Socket Connected');
            socket.on('disconnect', function(){
                console.log('Socket disconnected');
            });
            sendMessage(arr, socket);
        });
        res.sendFile(__dirname + '/index.html');
    }
    else
    res.sendFile(__dirname + '/error.html');
});

// Fallback handled here
app.get('/', function(req, res){
    res.sendFile(__dirname + '/error.html');
});

function sendMessage(data, socket){
    var interval = setInterval(function(){
        if(end){
            clearInterval(interval);
        }
        socket.emit('msg', data);
    }, 6000);
}


http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});