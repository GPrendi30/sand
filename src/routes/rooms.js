const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router();
const Room = require('../models/rooms');
const User = require('../models/user');
const ObjectId = require('mongodb').ObjectId
const { generateIdenticon } = require('../identicon');

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
//     author: author,in
//     admins: [author, user1],
//     users: [author, user1, user2, user3, user4],
//     messages: messages
// }
// res.render('single_room', room)

// TODO: Remove testing variables and return room.js to original state
// const obj = {
//     result: {
//         _id: 0
//     }
// }

// res.render('settings', obj);


router.get('/', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        Room.find({}).then(result => {
            if (!result) {
                res.status(404).end()
            }
            res.json(result)
        })
    } else {
        res.status(406).end()
    }
})

// room id not user id
router.get('/:_id', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        Room.findOne({ _id: new ObjectId(req.params._id) })
            .then(async result => {
                if (!result) res.status(404).end();
                const users = await User.find({ _id: { $in: result.members } })
                const admins = await User.find({ _id: { $in: result.admins } })
                const author = await User.find({ _id: result.author })
                //res.json(result)

                res.json(
                    {
                        messages: result.chat.getMessages(),
                        room: result,
                        author: author,
                        users: users,
                        admins: admins
                    }
                )
            })
    } else {
        res.status(406).end()
    }
})

router.post('/new', isLoggedIn, async function (req, res, next) {
    const author = await User.findOne({ _id: req.session.passport.user._id });
    const newRoom = new Room({
        author,
        name: req.body.name,
        description: req.body.description,
        icon: generateIdenticon(req.body.name, Date.now())
    });
    newRoom.addInitialAdmin(author, author);
    newRoom.addMember(author, author); //adding author to members
    newRoom.save()
        .then(result => {
            if (result) res.json(newRoom);
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        })
})


router.post('/:_id', isLoggedIn, function (req, res, next) {
    // modify room

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