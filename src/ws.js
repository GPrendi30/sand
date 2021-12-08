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
        // RECEIVE AND HANDLE PENDING FRIEND REQUESTS
        socket.on('friend.request.sent', friendRequest=>{
            // look for the friend request target and add request to his request list
            const receiver = friendRequest.receiver // the user who receives the friend request
            const sender = friendRequest.sender // the user who sent the request
            const filter =  { username: receiver }
            let user
            models.users.findOne(filter).then(result=>{
                user = result
                if (user === null) {
                    console.log('user not found')
                }
            }).then(function () {
                // add friend request and store changes on db
                user.friendrequests.push(sender)
                models.users.replaceOne(filter, user, { upsert: true })
                    .then(result => {
                        // changing button text once the request has been sent
                        if (result !== undefined) {
                            socket.emit('request.sent')
                            console.log('friend request from ' + sender + 'added to ' + receiver + 'pending requests')
                        } else {
                            console.log('receiver: ' + receiver + 'not found')
                        }
                    }).catch(err=>{ console.log(err) })
            }).catch(err=>{ console.log(err) });
        })

        // RECEIVE AND HANDLE ACCEPTED FRIEND REQUESTS
        socket.on('friend.request.accepted', acceptance=>{
            const sender = acceptance.sender // the user who sent the request
            const receiver = acceptance.receiver // the user who accepted it
            let filter  =  { username: receiver }
            let user
            // remove pending request from receiver
            // retreive receiver user
            models.users.findOne(filter).then(result=>{
                user = result
                if (user === null) {
                    console.log('receiver user :' + receiver + 'not found')
                }
            }).then(function () {
                // remove request from pending requests
                user.friendrequests = user.friendRequest.filter(function (value) {
                    return value !== sender;
                });
                // store receiver pending request array changes back in db
                models.users.replaceOne(filter, user, { upsert: true })
                    .then(result => {
                        // changing button text once the request has been sent
                        if (result !== undefined) {
                            console.log('removed' + sender + ' from ' + receiver + 'prending friend requests')
                        } else {
                            console.log('receiver: ' + receiver + 'not found')
                        }
                    })
            }).ten(function () {
                // add receiver to sender friendslist
                filter =  { username: sender }
                // retreive sender user
                models.users.findOne(filter).then(result=>{
                    user = result
                    if (user === null) {
                        console.log('sender user :' + sender + 'not found')
                    }
                }).then(function () {
                    // add receiver to sender friendlista array
                    user.friendslist.push(receiver)
                    // store receiver pending request array changes back in db
                    models.users.replaceOne(filter, user, { upsert: true })
                        .then(result => {
                            // changing button text once the request has been sent
                            if (result !== undefined) {
                                console.log('added' + receiver + ' to ' + sender + 'friendslist')
                                const newFriend = {newfriend: sender}
                                socket.emt('friend.added.to.sender.friendlist', newFriend)
                            } else {
                                console.log('sender: ' + sender + 'not found')
                            }
                        }).catch(err=>{ console.log(err) });
                }).catch(err=>{ console.log(err) });
            })
        })
        socket.io('unfriend', unfriend =>{
            let user = unfriend.user // the user who unfriends friend
            const friend = unfriend.friend // the unfriended friend
            const filter = { username: user }
            // retreive receiver user
            models.users.findOne(filter).then(result=>{
                user = result
                if (user === null) {
                    console.log('receiver user :' + unfriend.user + 'not found')
                }
            }).then(function () {
                // remove friend from friendlist
                user.friendslist = user.friendslist.filter(function (value) {
                    return value !== friend;
                });
                // store user friendlist back in db
                models.users.replaceOne(filter, user, { upsert: true })
                    .then(result => {
                        // changing button text once the request has been sent
                        if (result !== undefined) {
                            console.log('removed' + friend + ' from ' + unfriend.user + 'friendslist')
                            socket.emit('friend.removed', unfriend)
                        } else {
                            console.log('receiver: ' + unfriend.user + 'not found')
                        }
                    }).catch(err=>{ console.log(err) });
            }).catch(err=>{ console.log(err) });
        });
    })
}
// module.exports.eventBus = eventBus;
module.exports.init = init
