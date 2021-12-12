const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router()
const message1 = {
    user: 'gery',
    message: 'welcome back to this moment',
    time: '21.09.2052'
}
const message2 = {
    user: 'jim',
    message: 'Thanks',
    time: '21.09.2002'
}
const message3 = {
    user: 'not gery',
    message: 'My Ananas fell',
    time: '01.02.2052'
}

const room1 = {
    name: 'Tananas',
    author: 'geri',
    admin: ['jim', 'bob', 'geri'],
    users: ['not gery', 'every body else but gery and admins'],
    messages: [message1, message2, message3]
}
const room2 = {
    name: 'Tananas',
    author: 'geri',
    admin: ['jim', 'bob', 'geri'],
    users: ['not gery', 'every body else but gery and admins'],
    messages: [message1, message2, message3]
}
/* GET exchange page. */
router.get('/', isLoggedIn, function (req, res, next) {
    const roomName = req.query.roomNAme;
    if (req.accepts('application/json')) {
        if (!(roomname)) {
            res.json(rooms)
        } else if (user.chat.roomName) {
            res.json(user.chats.roomName)
        } else {
            res.status(404).end()
        }
    } else {
        res.status(406).end()
    }
    res.render('wip')
})

module.exports = router;
