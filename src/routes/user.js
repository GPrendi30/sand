const express = require('express')
const router = express.Router()
// Imports for database
const models = require('../models').model
const ObjectId = require('mongodb').ObjectId
const { isLoggedIn, isLoggedInSpecialized } = require('../login');
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
function removeSensitiveData (user) {
    if (user._id) {
        delete user._id
    }
    if (user.password) {
        delete user.password
    }
    if (user.name) {
        delete user.name
    }
    if (user.surname) {
        delete user.surname
    }
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

function createUser (req) {
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

/* GET user page. */
router.get('/', function (req, res, next) {
    models.users.find().toArray().then(result => {
        result.forEach(element => {
            removeSensitiveData(element)
        });
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
router.get('/:_id', function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end()
            } else {
                removeSensitiveData(user)
                res.json(user)
            }
        })
    } else {
        res.status(406).end()
    }
})

/* Get single user */
router.get('/profile/:_id', isLoggedInSpecialized, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result => {
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
router.get('/settings/:_id', isLoggedInSpecialized, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result => {
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

router.put('/settings/:_id', isLoggedInSpecialized, function (req, res, next) {
    const filter = { _id: new ObjectId(req.params._id) };

    const modify = {}
    modify[req.query.req] = req.body[req.query.req];
    console.log(modify)
    models.users.findOneAndUpdate(filter, { $set: modify }, { upsert: true }) // update + insert = upsert
        .then(result => {
            const found = (result.upsertedCount === 0);
            res.status(found ? 200 : 201).json(result);
        });
})

/* GET user assets page. */
router.get('/assets/:_id', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result => {
            const user = result
            if (user === null) {
                res.status(404).end();
            } else {
                res.json(user.collection)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user friends page. */
router.get('/friends/:_id', isLoggedIn, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result => {
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

/* GET user recently viewed assets page. */
router.get('/recentlyviewed/:_id', isLoggedInSpecialized, function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter = { _id: new ObjectId(req.params._id) }
        } catch (e) {
            return res.status(404);
        }
        models.users.findOne(filter).then(result => {
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
    models.users.findOne(filter).then(result => {
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
    models.users.findOne(filter).then(result => {
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
/* GET user pending friend request. */
router.get('/friendrequests/:_id', isLoggedInSpecialized, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    models.users.findOne(filter).then(result => {
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.json(user.friendrequests)
        } else {
            res.status(406).end()
        }
    })
})
// to do add tests
/* GET user blocked friend. */
router.get('/blocked/:_id', isLoggedInSpecialized, function (req, res, next) {
    let filter
    try {
        filter = { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    models.users.findOne(filter).then(result => {
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
    models.users.insertOne(user).then(result => {
        removeSensitiveData(user)
        res.status('201').json(user)
    })
})
*/

/* Put(edit) User , requires form. */
router.put('/:_id', isLoggedInSpecialized, function (req, res, next) {
    const user = createUser(req)
    const filter = { _id: new ObjectId(req.params._id) };
    models.users.replaceOne(filter, user, { upsert: true }) // update + insert = upsert
        .then(result => {
            const found = (result.upsertedCount === 0);
            removeSensitiveData(user)
            res.status(found ? 200 : 201).json(user);
        });
})


/* Delete Uses */
router.delete('/:_id', isLoggedInSpecialized, function (req, res) {
    const filter = { _id: new ObjectId(req.params._id) };
    models.users.findOneAndDelete(filter).then(result => {
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
