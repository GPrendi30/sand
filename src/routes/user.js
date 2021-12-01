const express = require('express')
const { MongoMissingCredentialsError, MongoCredentials } = require('mongodb')
const router = express.Router()
// Imports for database
const models = require('../models').model
const ObjectId = require('mongodb').ObjectId
// HELPER FUNCTIONS
/**
 * Function that emoves the sensitive data from a user object
 * such as (password,email,name,surname,settings)
 * @param {object} user the user from which we want to remove the sensitive data
 * @retun {Undefined}
 */
function removeSensitiveData (user) {
    delete user.password
    delete user.email
    delete user.name
    delete user.surname
    delete user.settings
}
function createUser (req) {
    const user = {
        //_id: req.body.id, provided from db
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
        tracking: req.body.tracking
    }
    return user
}

// ******* TEST TO BE REMOVED/REPLACED/REVIEWD WHEN DATABASE/LONGIN IS READY
// const users = []

// function createUserF (id, username, password, email, name, surname, wallet, collection, friendlist, settings, ppic, bio, tracking) {
//     const user = {
//         _id: id,
//         username: username,
//         password: password,
//         email: email,
//         name: name,
//         surname: surname,
//         wallet: wallet,
//         collection: collection,
//         friendlist: friendlist,
//         settings: settings,
//         ppic: ppic,
//         bio: bio,
//         tracking: tracking
//     }
//     return user
// }

// function addUser (user) {
//     users.push(user)
// }

// const dummyUser = createUserF('id', 'username', 'password', 'email', 'name', 'surname', 'wallet', [], [], { currency: 'eth', mode: 'dark' }, 'ppic', 'bio', [])
// const dummyUser2 = createUserF('id2', 'username', 'password', 'email', 'name', 'surname', 'wallet', [], [], { currency: 'eth', mode: 'dark' }, 'ppic', 'bio', [])
// addUser(dummyUser)
// addUser(dummyUser2)

// *********** END TEST

/* GET user page. */
router.get('/', function (req, res, next) {
    models.users.find().toArray().then(result=>{
        const user = result;
        if (result === undefined) {
            res.status(404).end();
        } else if (req.accepts('html')) {
            res.render('user', { user })
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
        try {
        const filter =  { _id: new ObjectId(req.params._id)} 
        } catch (e) {res.status(404).end}
        models.users.findOne(filter).then(result=>{
            const user = result
            if (result === undefined) {
                res.status(404).end();
            } else {
                res.json(result)
            }
        }).catch(err => { console.log(err) })
    } else {
        res.status(406).end()
    }
})

/* GET user settings page. */
router.get('/settings/:_id', function (req, res, next) {
    const filter =  { _id: new ObjectId(req.params._id) };
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === null) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.status(200).json(user.settings)
        } else {
            res.status(406).end()
        }
    })
})

/* GET user assets page. */
router.get('/assets/:_id', function (req, res, next) {
    const filter =  { _id: new ObjectId(req.params._id) };
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === undefined) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.status(200).json(user.collection)
        } else {
            res.status(406).end()
        }
    })
})

/* GET user friends page. */
router.get('/friends/:_id', function (req, res, next) {
    const filter =  { _id: new ObjectId(req.params._id) };
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === undefined) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.status(200).json(user.friendlist)
        } else {
            res.status(406).end()
        }
    })
})

/* GET user recently viewed assets page. */
router.get('/recently_viewed/:_id', function (req, res, next) {
// to complete
    res.send('route not implemented yet')
})

/* GET user following. */
router.get('/following/:_id', function (req, res, next) {
    const filter =  { _id: new ObjectId(req.params._id) };
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === undefined) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.status(200).json(user.tracking)
        } else {
            res.status(406).end()
        }
    })
})

/* GET user edit page. */
router.get('/edit/:_id', function (req, res, next) {
    const filter =  { _id: new ObjectId(req.params._id) };
    models.users.findOne(filter).then(result=>{
        const user = result
        if (user === undefined) {
            res.status(404).end();
        } else if (req.accepts('application/json')) {
            res.status(200).json(user)
        } else {
            res.status(406).end()
        }
    })
})

/* post user , requires form. */
router.post('/', function (req, res, next) {
    const user = createUser(req)
    models.users.insertOne(user).then(result => {
        res.status('200')
    })
})

/* Put(edit) User , requires form. */
router.put('/:id', function (req, res, next) {
    const user = createUser(req)
    const filter = { _id: new ObjectId(req.params._id) };
    models.users.replaceOne(filter, user, { upsert: true }) // update + insert = upsert
        .then(result => {
            const found = (result.upsertedCount === 0);
            res.status(found ? 200 : 201).json(user);
        });
})


/* Delete Uses */ //TO BE COMPLETED
router.delete('/:_id', function (req, res) {
  const filter = { _id: new ObjectId(req.params._id) };
  models.users.findOneAndDelete(filter).then(result => {
      if (result.value == null) {
          res.status(404).end();
      } else {
          if (req.accepts('application/json')) {
            res.status(200).json(result)
          } else {
              res.status(406).end();
          }
      }
  });
});


// export the required modules
module.exports = router
