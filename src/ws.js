const io = require('socket.io')()
// const EventEmitter = require('events');
// const eventBus = new EventEmitter();
const models = require('./models').model


function init (server) {
    console.log('Starting Web Server');

    io.attach(server);

    io.on('connection', function (socket) {
        console.log('SOCKET ID:' + socket.id)
        socket.on('disconnect', function () {
            console.log('client disconnected id:', socket.id);
        })
        // receive and handle friend request
        io.on('friend.request.sent', friendRequest=>{
            // look for the friend request target and add request to his request list
            const receiver = friendRequest.receiver
            const sender = friendRequest.sender
            let addFriendButton = friendRequest.addFriendButton
            let filter
            let user
            try {
                filter =  { username: receiver }
            } catch (e) { console.log(e) }
            models.users.findOne(filter).then(result=>{
                user = result
                if (user === null) {
                    console.log('user not found')
                }
            }).then(function () {
                // add friend request and store changes on db
                user.friendrequests.push(sender)
                filter = { username: friendRequest.sender };
                models.users.replaceOne(filter, user, { upsert: true })
                    .then(result => {
                        // changing button text once the request has been sent
                        if (result !== undefined) {
                            socket.emit('request.sent')
                            console.log('friend request from ' + sender + 'added to ' + receiver + 'pending requests')
                        } else {
                            console.log('receiver: ' + receiver + 'not found')
                        }
                    });
            })
        })
    })
}

// module.exports.eventBus = eventBus;
module.exports.init = init;
