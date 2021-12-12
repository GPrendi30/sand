const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router()

/* GET exchange page. */
router.get('/', function (req, res, next) {
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

    // TODO: Remove testing variables and return room.js to original state
    const obj = {
        result: {
            _id: 0
        }
    }
    
    res.render('settings', obj);
})

module.exports = router;
