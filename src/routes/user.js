const express = require('express')
const router = express.Router()
// ******* TO BE REMOVED/REPLACED/REVIEWD WHEN DATABASE/LONGIN IS READY 
const users = []

function createUser(id, username, password, email, name, surname, wallet, collection, friendlist, settings, ppic, bio, tracking) {
  const user = {
      '_id': id,
      'username': username,
      'password': password,
      'email': email,
      'name': name,
      'surname': surname,
      'wallet': wallet,
      'collection': collection,
      'friendlist': friendlist,
      'settings': settings,
      'ppic': ppic,
      'bio': bio,
      'tracking': tracking
  }
  return user
}

function addUser (user) {
  users.push(user)
}

// const dummyUser = createUser('id', 'username', 'password', 'email', 'name', 'surname', 'wallet', [], [], {currency : 'eth', mode : 'dark'}, 'ppic', 'bio', [])
// const dummyUser2 = createUser('id2', 'username', 'password', 'email', 'name', 'surname', 'wallet', [], [], {currency : 'eth', mode : 'dark'}, 'ppic', 'bio', [])
// addUser(dummyUser)
// addUser(dummyUser2)

// *********** END TEST

/* GET user page. */
router.get('/', function (req, res, next) {
  res.render('user')
})

// render single user?
router.get('/:_id', function (req, res, next) {
  let result = users
  result = result.filter(user => user._id === req.params._id)
  console.log('this is the user_id')
  console.log(result)
  if (result.length === 1) {
    res.status(200).json(result[0])
  } else {
    res.status(404).end()
  }
})

/* GET user settings page. */
router.get('/settings', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET user assets page. */
router.get('/assets', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET user friends page. */
router.get('/friends', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET user recently viewed assets page. */
router.get('/recently_viewed', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET user following. */
router.get('/following', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET user edit page. */
router.get('/edit', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

// export the required modules
module.exports = router
