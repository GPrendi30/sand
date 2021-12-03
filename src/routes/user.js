const express = require('express')
const { MongoMissingCredentialsError, MongoCredentials } = require('mongodb')
const router = express.Router()
// Imports for database
const models = require('../models').model
const ObjectId = require('mongodb').ObjectId
// HELPER FUNCTIONS

// TODO Write Documentation

function createUser (req) {
    const user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        wallet: req.body.wallet,
        collection: req.body.collection,
        friendlist: req.body.friendlist,
        settings: req.body.settings,
        ppic: req.body.ppic,
        bio: req.body.bio,
        tracking: req.body.tracking,
        recentlyviewed: req.body.tracking
    }
    return user
}

/* GET user page. */
router.get('/', function (req, res, next) {
    models.users.find().toArray().then(result=>{
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
            filter =  { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result=>{
            const user = result
            if (user === null) {
                res.status(404).end()
            } else {
                res.json(user)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user settings page. */
router.get('/settings/:_id', function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter =  { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result=>{
            const user = result
            if (user === null) {
                res.status(404).end();
            } else {
                res.json(user.settings)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user assets page. */
router.get('/assets/:_id', function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter =  { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result=>{
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
router.get('/friends/:_id', function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter =  { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result=>{
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
router.get('/recentlyviewed/:_id', function (req, res, next) {
    if (req.accepts('application/json')) {
        let filter
        try {
            filter =  { _id: new ObjectId(req.params._id) }
        } catch (e) { res.status(404) }
        models.users.findOne(filter).then(result=>{
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
router.get('/following/:_id', function (req, res, next) {
    let filter
    try {
        filter =  { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.json(user.tracking)
        } else {
            res.status(406).end()
        }
    })
})

/* GET user edit page. */
router.get('/edit/:_id', function (req, res, next) {
    let filter
    try {
        filter =  { _id: new ObjectId(req.params._id) }
    } catch (e) { res.status(404) }
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === null) {
            res.status(404).end();
        }
        if (req.accepts('application/json')) {
            res.json(user)
        } else {
            res.status(406).end()
        }
    })
})

/* post user , requires form. */
router.post('/', function (req, res, next) {
    console.log(req);
    const user = createUser(req)
    console.log(req.body);
    models.users.insertOne(user).then(result => {
        res.status('201').json(user)
    })
})

/* Put(edit) User , requires form. */
router.put('/:_id', function (req, res, next) {
    const user = createUser(req)
    const filter = { _id: new ObjectId(req.params._id) };
    models.users.replaceOne(filter, user, { upsert: true }) // update + insert = upsert
        .then(result => {
            const found = (result.upsertedCount === 0);
            res.status(found ? 200 : 201).json(user);
        });
})


/* Delete Uses */
router.delete('/:_id', function (req, res) {
    const filter = { _id: new ObjectId(req.params._id) };
    models.users.findOneAndDelete(filter).then(result => {
        if (result.value == null) {
            res.status(404).end();
        } else {
            if (req.accepts('application/json')) {
                res.status(204).json(result)
            } else {
                res.status(406).end();
            }
        }
    });
});


// export the required modules
module.exports = router
