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

module.exports = router
