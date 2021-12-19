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
