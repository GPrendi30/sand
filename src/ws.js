const io = require('socket.io')()
const eventBus = require('./eventBus');
const models = require('./models').model
const { passport } = require('./login')
const session = require('./app').session
const Room = require('./models/rooms');
const User = require('./models/user');
const Message = require('./models/chat').Message;
const Chat = require('./models/chat');

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(session));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// authentication validator
io.use((socket, next) => {
    // if request.user is an object (is not undefined)
    // the passport has authenticated a user
    if (socket.request.user) {
        next();
    } else { // no user authorization.
        next(new Error('unauthorized'))
    }
});

function init (server) {
    console.log('Starting Web Server');

    io.attach(server);

    io.on('connection', function (socket) {
        console.log('SOCKET ID:' + socket.id)
        socket.on('disconnect', function () {
            console.log('client disconnected id:', socket.id);
        })


        // saving a socket in a session
        // connecting the same session we use for the app to the sockets.
        const session = socket.request.session;
        console.log(`saving sid ${socket.id} in session ${session.id}`);
        session.socketId = socket.id;
        session.save();

        // RECEIVE AND HANDLE PENDING FRIEND REQUESTS
        socket.on('friend.request.sent', friendRequest => {
            // look for the friend request target and add request to his request list
            const receiver = friendRequest.receiver // the user who receives the friend request
            const sender = friendRequest.sender // the user who sent the request
            const filter = { username: receiver }
            let user
            models.users.findOne(filter).then(result => {
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
                    }).catch(err => { console.log(err) })
            }).catch(err => { console.log(err) });
        })

        // RECEIVE AND HANDLE ACCEPTED FRIEND REQUESTS
        socket.on('friend.request.accepted', acceptance => {
            const sender = acceptance.sender // the user who sent the request
            const receiver = acceptance.receiver // the user who accepted it
            let filter = { username: receiver }
            let user
            // remove pending request from receiver
            // retreive receiver user
            models.users.findOne(filter).then(result => {
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
            }).then(function () {
                // add receiver to sender friendslist
                filter = { username: sender }
                // retreive sender user
                models.users.findOne(filter).then(result => {
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
                                const newFriend = { newfriend: sender }
                                socket.emt('friend.added.to.sender.friendlist', newFriend)
                            } else {
                                console.log('sender: ' + sender + 'not found')
                            }
                        }).catch(err => { console.log(err) });
                }).catch(err => { console.log(err) });
            })
        })
        socket.on('unfriend', unfriend => {
            let user = unfriend.user // the user who unfriends friend
            const friend = unfriend.friend // the unfriended friend
            const filter = { username: user }
            // retreive receiver user
            models.users.findOne(filter).then(result => {
                user = result
                if (user === null) {
                    console.log('user :' + unfriend.user + 'not found')
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
                    }).catch(err => { console.log(err) });
            }).catch(err => { console.log(err) });
        });

        socket.on('block.friend', blocked => {
            const blockerUser = blocked.user // the user who unfriends friend
            let user
            const friend = blocked.friend // the unfriended friend
            const filter = { username: blockerUser }
            // retreive receiver user
            models.users.findOne(filter).then(result => {
                user = result
                if (user === null) {
                    console.log('user :' + blockerUser + 'not found')
                }
            }).then(function () {
                // remove friend from friendlist if he is in there
                user.friendslist = user.friendslist.filter(function (value) {
                    return value !== friend;
                });
                // add user to blocked users
                user.blocked.push(friend)
                // store user changes back in db
                models.users.replaceOne(filter, user, { upsert: true })
                    .then(result => {
                        // changing button text once the request has been sent
                        if (result !== undefined) {
                            console.log('removed' + friend + ' from ' + blockerUser + 'friendslist and added to blocked')
                            socket.emit('friend.successfully.blocked', blocked)
                        } else {
                            console.log('receiver: ' + blockerUser + 'not found')
                        }
                    }).catch(err => { console.log(err) });
            }).catch(err => { console.log(err) });
        })

        socket.on('unlock.friend', unlocked => {
            const unlockerUser = unlocked.user // the user who unlocks friend
            let user
            const friend = unlocked.friend // the unfriended friend
            const filter = { username: unlockerUser }
            // retreive unlocker user
            models.users.findOne(filter).then(result => {
                user = result
                if (user === null) {
                    console.log('user :' + unlockerUser + 'not found')
                }
            }).then(function () {
                // remove friend from blocked if he is in there
                user.blocked = user.blocked.filter(function (value) {
                    return value !== friend;
                });
                // store user changes back in db
                models.users.replaceOne(filter, user, { upsert: true })
                    .then(result => {
                        if (result !== undefined) {
                            //
                            console.log('removed' + friend + ' from ' + unlockerUser + 'blocked')
                            socket.emit('friend.successfully.ulocked', unlocked)
                        } else {
                            console.log('unlocker: ' + unlockerUser + 'not found')
                        }
                    }).catch(err => { console.log(err) });
            }).catch(err => { console.log(err) });
        })

        // tracking

        socket.on('track', async tracking=>{
            const asset = tracking.asset
            const user = await User.find(tracking.user)
            user.tracking.push(asset)
            user.recentlyViewed.push(asset)
            const filter = { username: user.username }
            await User.replaceOne(filter, user, { upsert: true })
            console.log('asset: ' + asset + ' added to ' + user.username + ' tracking list')
            console.log('asset: ' + asset + ' added to ' + user.username + ' recentlyviewed')
            socket.emit('asset.added', tracking);
        })

        socket.on('untrack', async untracking=>{
            const asset = untracking.asset
            const user = await User.find(untracking.user)
            const index = user.tracking.indexOf(asset)
            user.tracking.splice(index, 1)
            const filter = { username: user.username }
            await User.replaceOne(filter, user, { upsert: true })
            console.log('asset: ' + asset + ' added to ' + user.username + ' tracking list')
            socket.emit('asset.removed', untracking);
        })
        // rooms
        // admins
        socket.on('add.admin', async add => {
            const room = await Room.find(add.room)
            room.addAdmin(add.author, add.user)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('admin' + add.user + 'added by ' + add.author + 'to' + room.getRoomId)
            socket.emit('admin.added', add)
        })

        socket.on('remove.admin', async remove => {
            const room = await Room.find(remove.room)
            room.removeAdmin(remove.author, remove.user)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            socket.emit('admin.removed', remove)
        })

        // members
        socket.on('add.member', async add => {
            const room = await Room.find(add.room)
            room.addMember(add.admin, add.user)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('member' + add.user + 'added by ' + add.admin + 'to' + room.getRoomId)
            socket.emit('member.added', add)
        })

        socket.on('remove.member', async remove => {
            const room = await Room.find(remove.room)
            room.removeMember(remove.admin, remove.user)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            socket.emit('member.removed', remove)
        })

        socket.on('set.icon', async setting=>{
            const room = await Room.find(setting.room)
            room.setIcon(setting.admin, setting.icon)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('icon added by ' + setting.admin + 'to' + room.getRoomId)
            socket.emit('icon.setted', setting)
        })

        socket.on('set.name', async setting=>{
            const room = await Room.find(setting.room)
            room.setName(setting.admin, setting.name)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('name added by ' + setting.admin + 'to' + room.getRoomId)
            socket.emit('name.added', setting)
        })

        socket.on('set.desc', async setting=>{
            const room = await Room.find(setting.room)
            room.setDesc(setting.admin, setting.desc)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('desc added by ' + setting.admin + 'to' + room.getRoomId)
            socket.emit('desc.added', setting)
        })
        socket.on('room.message.sent', event => {
            const sender = socket.request.session.user;
            const message = new Message({ user: sender, message: event.message })
        })

        socket.on('send', async event=>{
            const chat = await Chat.find(event.chat)
            const message = event.message
            Chat.addMessage(message)
            const filter = { _id: chat._id }
            await Chat.replaceOne(filter, chat, { upsert: true })
            socket.emit('message.sent', event)
        })

        socket.on('add.user', async event=>{
            const chat = await Chat.find(event.chat)
            const user = event.user
            chat.addUser(user)
            const filter = { _id: chat._id }
            await Chat.replaceOne(filter, chat, { upsert: true })
            socket.emit('user.added', event)
        })
    })
}
eventBus.on('io', () => {
    console.log('io event')
})

eventBus.on('tracking_update', update => {
    console.log('sending tracking update...')
    io.emit('tracking_update', update)
})

module.exports.eventBus = eventBus;
module.exports.init = init;
