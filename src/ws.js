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
let users;
(async () => { users = await User.find({}); })();
// io.use(wrap(passport.initialize()))

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
    if (socket.request.user.logged_in) {
        next();
    } else { // no user autherization
        next('disconnect')
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

const authenticatedSockets = {};

function init(server) {
    console.log('Starting Web Server');

    io.attach(server);

    io.on('connection', async function (socket) {
        // fetch user object from db for later use
        // optimized to only fetch user once
        authenticatedSockets[socket.id] = await User.findOne({ _id: socket.request.user._id });

        console.log('SOCKET ID:' + socket.id)

        socket.on('disconnect', function () {
            console.log('client disconnected id:', socket.id);
            delete authenticatedSockets[socket.id];
        })


        // userId 
        const userId = String(socket.request.user._id);


        // optimized user fetching from the database
        // only fetch the user when the first socket connects
        const socketset = io.sockets.adapter.rooms.get(userId);
        if (!socketset) {
            authenticatedSockets[socket.id] = await User.findOne({ _id: socket.request.user._id });
        } else {
            const socketWithSameUser = Array.from(socketset)[0];
            authenticatedSockets[socket.id] = authenticatedSockets[socketWithSameUser];
        }
        
         // join user room
        socket.join(userId)
       

        // console.log('user connected id:', authenticatedSockets[socket.id]);

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
                const friend = await User.findOne({ _id: friendRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.sendFriendRequest(friend);
                socket.to(String(user._id)).emit('friend.request.sent.accepted', { message: 'Request sent', sent: true, user: friend.username })
            } catch (e) {
                socket.to(String(user._id)).emit('friend.request.sent.rejected', { message: 'User not found', sent: false, user: null });
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
                const friend = await User.findOne({ _id: acceptResponse.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.acceptFriendRequest(friend);
                socket.to(String(user._id)).emit('friend.request.accpted', { message: 'Request Accepted', sent: true, user: friend.username })
            } catch (e) {
                socket.to(String(user._id)).emit('friend.request.rejected', { message: 'User not found', sent: false, user: null });
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
                const friend = await User.findOne({ _id: unfriendRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.unFriend(friend);
                socket.to(String(user._id)).emit('Unfriend.request.accepted', { message: 'Friend unfriended', sent: true, user: friend.username })
            } catch (e) {
                socket.to(String(user._id)).emit('Unfriend.request.rejected', { message: 'User not found', sent: false, user: null });
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
                const friend = await User.findOne({ _id: blockRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.blockFriend(friend);
                socket.to(String(user._id)).emit('friend.request.block.accepted', { message: 'Friend blocked', sent: true, user: friend.username })
            } catch (e) {
                socket.to(String(user._id)).emit('friend.request.block.rejected', { message: 'User not found', sent: false, user: null });
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
                const friend = await User.findOne({ _id: unblockRequest.receiver });
                if (friend === null) throw new Error('Friend not found');

                user.unblockFriend(friend);
                socket.to(String(user._id)).emit('friend.request.unblock.accepted', { message: 'Friend unblocked', sent: true, user: friend.username })
            } catch (e) {
                socket.to(String(user._id)).emit('friend.request.unblock.rejected', { message: 'User not found', sent: false, user: null });
            }
        })


        socket.on('asset.event.track', async trackingEvent => {
            const asset = trackingEvent.asset
            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.

            user.track(asset) // track asset
            user.recentlyViewed.push(asset) // add to recently viewed

            // TODO remove
            console.log('asset: ' + asset + ' added to ' + user.username + ' tracking list')
            console.log('asset: ' + asset + ' added to ' + user.username + ' recentlyviewed')
            socket.to(String(user._id)).emit('asset.event.added', { message: 'Asset added to tracking list', finalized: true, asset: asset });
        })

        socket.on('asset.event.untrack', async untrackingEvent => {
            const asset = untrackingEvent.asset
            const user = authenticatedSockets[socket.id];
            if (user == null) return; // more checks better.

            user.untrack(asset) // track asset
            console.log('asset: ' + asset + ' added to ' + user.username + ' tracking list')
            socket.to(String(user._id)).emit('asset.event.removed', { message: 'Asset removed from tracking list', finalized: true, asset: asset });
        })


        socket.on('room.event.add.admin', async addAdminEvent => {
            const room = await Room.findOne({ _id: addAdminEvent.room })

            const user = authenticatedSockets[socket.id];
            room.addAdmin(user, addAdminEvent.user)

            // TODO remove
            // console.log('admin' + add.user + 'added by ' + add.user + 'to' + room.getRoomId)
            socket.to(room._id).emit('room.event.admin.added', { message: 'Admin added to room', finalized: true, user: addAdminEvent.user, room: addAdminEvent.room })
        })

        socket.on('room.event.remove.admin', async removeAdminEvent => {
            const room = await Room.findOne({ _id: removeAdminEvent.room })

            const user = authenticatedSockets[socket.id];
            room.removeAdmin(user, removeAdminEvent.user)

            socket.to(room._id).emit('room.event.admin.removed', { message: 'Admin removed from room', finalized: true, user: removeAdminEvent.user, room: removeAdminEvent.room })
        })

        // members
        socket.on('room.event.add.member', async addMemberEvent => {
            const room = await Room.findOne({ _id: addMemberEvent.room })

            const user = authenticatedSockets[socket.id];
            room.addMember(user, addMemberEvent.user)

            // console.log('member' + add.user + 'added by ' + add.admin + 'to' + room.getRoomId)
            socket.to(String(user._id)).emit('room.event.member.added',
                {
                    message: 'Member added to room',
                    finalized: true,
                    user: addMemberEvent.user,
                    room: addMemberEvent.room
                })
        })

        socket.on('room.event.remove.member', async removeMemberEvent => {
            const room = await Room.findOne({ _id: removeMemberEvent.room })

            const user = authenticatedSockets[socket.id];
            room.removeMember(user, removeMemberEvent.user)

            socket.to(room._id).emit('member.removed', remove)
        })

        socket.on('room.event.set.name', async setNameEvent => {
            const room = await Room.findOne({ _id: setNameEvent.room })

            const user = authenticatedSockets[socket.id];

            room.setName(user, setNameEvent.name)

            socket.to(room._id).emit('room.event.name.set', { message: 'Room name set', finalized: true, name: setNameEvent.name, room: setNameEvent.room })
        })


        socket.on('room.event.set.desc', async setDescEvent => {
            const room = await Room.findOne({ _id: setDescEvent.room })

            const user = authenticatedSockets[socket.id];

            room.setName(user, setDescEvent.name)

            socket.to(room._id).emit('room.event.desc.set', { message: 'Room description set', finalized: true, desc: setDescEvent.desc, room: setNameEvent.room })
        })

        socket.on('room.event.send.message', async sendMessageEvent => {
            const room = await Room.findOne({ _id: sendMessageEvent.room })
            const user = authenticatedSockets[socket.id];
            
            console.log('message arrived', sendMessageEvent.message)
            room.sendMessage(user, sendMessageEvent.message);

            room.save();
            socket.to(room._id).emit('room.event.message.sent', { message: 'Message sent', finalized: true, sentMessage: sendMessageEvent.message, room: sendMessageEvent.room })
        })

        socket.on('chat.event.send.message', async event => {
            const chat = await Chat.findOne({ _id: event.chat })
            const message = event.message
            const user = authenticatedSockets[socket.id];
            chat.sendMessage(user, message)

            socket.to(String(user._id)).emit('chat.event.message.sent', { message: 'Message sent', finalized: true, sentMessage: event.message })
        })

        socket.on('chat.event.add.user', async event => {
            const chat = await Chat.findOne({ _id: event.chat })
            const user = await User.findOne({ _id: event.user })
            chat.addUser(user);

            socket.to(String(user._id)).emit('chat.event.user.added', { message: 'User added to chat', finalized: true, user: event.user })
        })
    })
}

eventBus.on('io', () => {
    console.log('io event')
})

// tracking update dispatcher
eventBus.on('tracking_update', events => {
    console.log('hello')
    users.forEach(user => {
        const socketset = io.sockets.adapter.rooms.get(String(user._id));
        // if (socketset == null) return;
        console.log('hello')
        events.forEach(event => {
            if (event.asset == null) return;
            if (!user.isTracking(event.asset.name) ||
                !user.isTracking(event.asset.symbol) ||
                !user.isTracking(event.metadata.seller) ||
                !user.isTracking(event.metadata.buyer)) {
                    console.log('sending tracking update to ' + user.username)
                    io.to(String(user._id)).emit('tracking_update', event)
            }
        });
    })
});

module.exports.eventBus = eventBus;
module.exports.init = init;
