const io = require('socket.io')();
const EventEmitter = require('events');
const eventBus = new EventEmitter();

const models = require('./models').model; 
const ObjectId = require('mongodb').ObjectId;

function init (server) {
    console.log("Starting Web Server");
    io.attach(server);
    io.on('connection', function (socket) {
        console.log("SOCKET ID: "+socket.id);

        socket.on('disconnect', function () {
            console.log('client disconnected id:', socket.id);
        });
    });
}

module.exports.eventBus = eventBus;
module.exports.init = init;