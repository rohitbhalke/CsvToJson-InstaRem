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

app.get('/', function(req, res){
    var arr = [];
    var remoteCSVURL, query;

    converter.on("record_parsed", function (jsonObj) {
        arr.push(jsonObj);
    });

    converter.on("end_parsed",function(jsonObj){
        console.log("*******************"); //here is your result json object
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
    }
    res.sendFile(__dirname + '/index.html');
});


function sendMessage(data, socket){
    var interval = setInterval(function(){
        if(end){
            clearInterval(interval);
        }
        socket.emit('msg', data);
    }, 6000);
}


http.listen(3000, function(){
    console.log('listening on *:3000');
});