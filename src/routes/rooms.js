const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router()

const message1 = {
    user: 'gery',
    username: 'the gery',
    body: 'welcome back to this moment',
    attachments: ['images'],
    timestamp: '21.09.2052'
}
const message2 = {
    user: 'swush',
    username: 'push',
    body: 'nice',
    attachments: ['images'],
    timestamp: '21.09.2052'
}
const message3 = {
    user: 'paul',
    username: 'tatu',
    body: 'sweet',
    attachments: ['images'],
    timestamp: '21.09.2052'
}

const chat1 = { 
    users: ['not gery', 'every body else but gery and admins'],
    messages: [message1, message2, message3] 
}

const room1 = {
    author: 'geri',
    description: 'nice',
    name: 'Tananas',
    icon: 'tha pic',
    admins: ['jim', 'bob', 'geri'],
    members: ['not gery', 'every body else but gery and admins'],
    chat: chat1
}
const room2 = room1
const room3 = room2
const rooms = [room1, room2, room3]

/* GET exchange page. */
router.get('/', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        if (!rooms) {
            res.status(404).end()
        }
        res.json(rooms)
    } else {
        res.status(406).end()
    }
})

// room id not user id
router.get('/:_id', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        if (id === undefined) {
            res.status(404).end()
        }
        res.json(rooms)
    } else {
        res.status(406).end()
    }
})
// router.get('/', function (req, res, next) {
/* TODO: Delete room variable used for testing */
/* Uncomment below (and recompile views) to test out single_room view */

// const author = { id: 'user0', username: 'Gerald of Rivia' };
// const user1 = { id: 'user1', username: 'User 1' };
// const user2 = { id: 'user2', username: 'User 2' };
// const user3 = { id: 'user3', username: 'User 3' };
// const user4 = { id: 'user4', username: 'Username that is waaay too long like for real this is ridiculous' };
// const msg0 = { user: author, msg: 'Coding is Coding. Lesser, greater, middling… Makes no difference. The degree is arbitary. The definitions blurred. If I’m to choose between one language and another… I’d rather not choose at all.' }
// const msg1 = { user: user1, msg: 'what are u on mate' };
// const msg2 = { user: user2, msg: 'Hello' };
// const msg3 = { user: user3, msg: 'Ciao' };
// const msg4 = { user: user4, msg: 'Hola' };
// let messages = [msg0, msg1, msg2, msg2, msg2, msg3, msg4];
// messages = messages.concat(messages);
// messages = messages.concat(messages);
// const room = {
//     author: author,
//     admins: [author, user1],
//     users: [author, user1, user2, user3, user4],
//     messages: messages
// }
// res.render('single_room', room)

//     res.render('wip');
// })
module.exports = router
