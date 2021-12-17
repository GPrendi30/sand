const io = require('socket.io')()
const eventBus = require('./eventBus');
const passportSocketIo = require('passport.socketio');
const models = require('./models').model
const { passport, session } = require('./app')
const sharedsession = require("express-socket.io-session");
const Room = require('./models/rooms');
const User = require('./models/user');
const { Chat, Message } = require('./models/chat')
const store = require('./redis').store;

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);


/*


// authentication validator

*/

//io.use(wrap(passport.initialize()))

io.use(sharedsession(session, {
    autoSave: true
}));

io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: 'sandsandsandsand',
    passport: passport,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

io.use((socket, next) => {
    // if request.user is an object (is not undefined)
    // the passport has authenticated a user
    if (socket.request.user) {
        next();
    } else { // no user authorization.
        next(new Error('unauthorized'))
    }
});

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
   
    
    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept, times) {
    if (error) {
        console.log('error')
    }
    console.log('failed connection to socket.io:', message);

    // We use this callback to log all of our failed connections.
    accept(null, false);
}

function init(server) {
    console.log('Starting Web Server');

    io.attach(server);

    io.on('connection', function (socket) {
        console.log('SOCKET ID:' + socket.id)

        socket.on('disconnect', function () {
            console.log('client disconnected id:', socket.id);
        })

        
        // saving a socket in a session
        // connecting the same session we use for the app to the sockets.
        console.log(Object.keys(io.sockets.sockets))
        // RECEIVE AND HANDLE PENDING FRIEND REQUESTS
        socket.on('friend.request.sent', async friendRequest => {
            /**
             * sender: me
             * receiver: the friend
             * socket: mySocket
             */
            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.
            try {
                const friend = await User.find({ _id: friendRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.sendFriendRequest(friend);
                socket.emit('friend.request.result', { message: 'Request sent', sent: true, user: friend.username })
            } catch (e) {
                socket.emit('friend.request.result', { message: 'User not found', sent: false, user: null });
            }
        });

        // RECEIVE AND HANDLE ACCEPTED FRIEND REQUESTS
        socket.on('friend.request.accept', async acceptResponse => {
            /**
             * I accept this a friend request
             * sender: me
             * receiver: friend
             */

            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.

            try {
                const friend = await User.find({ _id: acceptResponse.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.acceptFriendRequest(friend);
                socket.emit('friend.request.result', { message: 'Request Accepted', sent: true, user: friend.username })
            } catch (e) {
                socket.emit('friend.request.result', { message: 'User not found', sent: false, user: null });
            }
        })


        socket.on('friend.request.unfriend', async unfriendRequest => {
            /**
             * sender: me,
             * receiver: friend
             */

            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.

            try {
                const friend = await User.find({ _id: unfriendRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.unFriend(friend);
                socket.emit('friend.request.result', { message: 'Friend unfriended', sent: true, user: friend.username })
            } catch (e) {
                socket.emit('friend.request.result', { message: 'User not found', sent: false, user: null });
            }
        });

        socket.on('friend.request.block', async blockRequest => {
            /**
             * sender: me,
             * receiver: friend
             */

            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.

            try {
                const friend = await User.find({ _id: blockRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.blockFriend(friend);
                socket.emit('friend.request.result', { message: 'Friend blocked', sent: true, user: friend.username })
            } catch (e) {
                socket.emit('friend.request.result', { message: 'User not found', sent: false, user: null });
            }
        })

        socket.on('friend.request.unblock', async unblockRequest => {
            /**
             * sender: me,
             * receiver: friend
             */

            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.

            try {
                const friend = await User.find({ _id: unblockRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.unblockFriend(friend);
                socket.emit('friend.request.result', { message: 'Friend unblocked', sent: true, user: friend.username })
            } catch (e) {
                socket.emit('friend.request.result', { message: 'User not found', sent: false, user: null });
            }
        })

        // tracking

        socket.on('track', async tracking => {
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

        socket.on('untrack', async untracking => {
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

        socket.on('set.icon', async setting => {
            const room = await Room.find(setting.room)
            room.setIcon(setting.admin, setting.icon)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('icon added by ' + setting.admin + 'to' + room.getRoomId)
            socket.emit('icon.setted', setting)
        })

        socket.on('set.name', async setting => {
            const room = await Room.find(setting.room)
            room.setName(setting.admin, setting.name)
            const filter = { _id: room.getRoomId() }
            await Room.replaceOne(filter, room, { upsert: true })
            console.log('name added by ' + setting.admin + 'to' + room.getRoomId)
            socket.emit('name.added', setting)
        })

        socket.on('set.desc', async setting => {
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

        socket.on('send', async event => {
            const chat = await Chat.find(event.chat)
            const message = event.message
            Chat.addMessage(message)
            const filter = { _id: chat._id }
            await Chat.replaceOne(filter, chat, { upsert: true })
            socket.emit('message.sent', event)
        })

        socket.on('add.user', async event => {
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
