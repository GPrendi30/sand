const express = require('express')
const router = express.Router()
// Imports for database
const ObjectId = require('mongodb').ObjectId
const { isLoggedIn, isLoggedInSpecialized } = require('../login');
const connection = require('../models')
const User = require('../models/user');
const generateIdenticon = require('../identicon').generateIdenticon;
// HELPER FUNCTIONS

/* TODO update with authentication, and also refactor the test */

/**
 * Function that emoves the sensitive data from a user object
 * such as (password,email,name,surname,settings)
 * @param {object} user the user from which we want to remove the sensitive data
 * @retun {Undefined}
 */

// TO DO Update removesensitive data to remove friendslist and blocked + UPDATE TESTING
function removeSensitiveData(user) {
    if (user._id) {
        delete user._id
    }
    if (user.password) {
        delete user.password
    }
    // if (user.name) {
    //     delete user.name
    // }
    // if (user.surname) {
    //     delete user.surname
    // }
    if (user.settings) {
        delete user.settings
    }
    if (user.wallet) {
        delete user.wallet
    }
    if (user.email) {
        delete user.email
    }
    // TO DO add testssssssssssssss
    if (user.blocked) {
        delete user.blocked
    }
    if (user.tracking) {
        delete user.tracking
    }
    if (user.friendrequests) {
        delete user.friendrequests
    }
    if (user.recentlyviewed) {
        delete user.recentlyviewed
    }
    if (user.collection) {
        delete user.collection
    }

    if (user.friendlist) {
        delete user.friendlist
    }
    if (user.chats) {
        delete user.chats
    }
    if (user.rooms) {
        delete user.rooms
    }
}

// TODO Write Documentation

function createUser(req) {
    const user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        wallet: req.body.wallet,
        // collection: req.body.collection,
        friendlist: req.body.friendlist,
        friendrequests: req.body.friendrequests,
        blocked: req.body.blocked,
        settings: req.body.settings,
        ppic: req.body.ppic,
        bio: req.body.bio,
        tracking: req.body.tracking,
        recentlyviewed: req.body.tracking
        // chats: {},
        // rooms: []
    }
    return user
}


/* Get single user */
router.get('/me', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.passport.user._id) }
        } catch (e) { res.status(404) }
        User.findOne(filter)
            .then(result => {
                const user = result
                if (user === null) {
                    res.status(404).end();
                } else {
                    // removeSensitiveData(user)
                    res.json(user)
                }
            })
            .catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})


/* GET user page. */
router.get('/all', function (req, res, next) {
    User.find().then(result => {
        result = result.map(element => removeSensitiveData(element));
        const user = result;
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.status(200).json(result)
        } else {
            res.status(406).end()
        }
    })
})



/* Get single user */
router.get('/profile', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        User.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end()
            } else {
                res.render('profile', { user })
            }
        })
    } else {
        res.status(406).end()
    }
})

/* GET user settings page. */
router.get('/settings/', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        console.log(req.session.passport.user)
        try {
            filter = { _id: new ObjectId(req.session.passport.user._id) }
        } catch (e) { res.status(404) }
        User.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end();
            } else {
                res.json(user)
                // res.render('settings', { result: user })
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

router.put('/settings/', isLoggedIn, function (req, res, next) {


    const filter = { _id: new ObjectId(req.session.passport.user._id) };

    const modify = {}
    modify[req.query.req] = req.body[req.query.req];
    
    User.findOneAndUpdate(filter, { $set: modify }, { upsert: true }).then(result => {
        res.status(result !== undefined ? 200 : 201).json(result);
    });
})

/* GET user assets page. */
router.get('/assets/:_id', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        User.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end();
            } else {
                res.json(user.assets)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user friends page. */
router.get('/friends/', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.session.passport.user._id) }
        } catch (e) { res.status(404) }
        User.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end();
            } else {
                res.json(user.friendlist)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user pending friend request. */
router.get('/friendrequest', isLoggedIn, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.session.passport.user._id) }
    } catch (e) { res.status(404) }
    User.findOne(filter).then(async result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            const friendRequests = await User.find({ _id: { $in: user.friendRequest } })
            res.json(friendRequests)
        } else {
            res.status(406).end()
        }
    })
})

/* GET user pending friend request. */
router.get('/friendrequestsent', isLoggedIn, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.session.passport.user._id) }
    } catch (e) { res.status(404) }
    User.findOne(filter).then(result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.json(user.friendRequestSent)
        } else {
            res.status(406).end()
        }
    })
})



/* GET user recently viewed assets page. */
router.get('/recentlyviewed/:_id', isLoggedInSpecialized, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) {
            return res.status(404);
        }

        User.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end();
            } else {
                res.json(user.recentlyviewed)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user following. */
router.get('/following/:_id', isLoggedIn, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    User.findOne(filter).then(result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.json(user.tracking)
        } else {
            res.status(403).end()
        }
    })
})

/* GET user edit page. */
router.get('/edit/:_id', isLoggedInSpecialized, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    User.findOne(filter).then(result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        }
        if (req.accepts('application/json')) {
            removeSensitiveData(user)
            res.json(user)
        } else {
            res.status(406).end()
        }
    })
})
// to do add tests

// to do add tests
/* GET user blocked friend. */
router.get('/blocked/:_id', isLoggedInSpecialized, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    User.findOne(filter).then(result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.json(user.blocked)
        } else {
            res.status(406).end()
        }
    })
})

router.get('/chats/:_id', isLoggedInSpecialized, function (req, res, next) {
    let filter

    const chatID = req.query.chat;
    try {
        filter = { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    models.users.findOne(filter).then(result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            if (!(chatID)) {
                res.json(user.chats)
            } else if (user.chats.chatID) {
                res.json(user.chats.chatID)
            } else {
                res.status(404).end()
            }
        } else {
            res.status(406).end()
        }
    })
})



/**
 * @DEPRECATED
 * Is replaced with authentication middleware
 */
/*
router.post('/', function (req, res, next) {
    console.log(req);
    const user = createUser(req)
    console.log(req.body);
    User.insertOne(user).then(result => {
        removeSensitiveData(user)
        res.status('201').json(user)
    })
})
*/

/* Put(edit) User , requires form. */
router.put('/:_id', isLoggedInSpecialized, function (req, res, next) {
    const user = createUser(req)
    const usr = new User(user);
    const filter = { _id: new ObjectId(req.params._id) };
    User.replaceOne(filter, usr, { upsert: true }) // update + insert = upsert
        .then(result => {
            const found = (result.upsertedCount === 0);
            removeSensitiveData(user)
            res.status(found ? 200 : 201).json(user);
        });
})


/* Delete Uses */
router.delete('/:_id', isLoggedInSpecialized, function (req, res) {
    const filter = { _id: new ObjectId(req.params._id) };
    User.findOneAndDelete(filter).then(result => {
        if (result.value == null) {
            res.status(404).end();
        } else {
            if (req.accepts('application/json')) {
                removeSensitiveData(result)
                res.status(204).json(result)
                req.logOut();
            } else {
                res.status(406).end();
            }
        }
    });
});



router.get('/identicon/:username', function (req, res) {
    const identicon = generateIdenticon(req.params.username, Date.now())
    res.status(200).send(identicon)
})
// export the required modules
module.exports = router
