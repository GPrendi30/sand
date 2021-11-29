const express = require('express')
const router = express.Router()

/* GET exchange page. */
router.get('/', function (req, res, next) {
  res.render('exchange')
})

/* GET exchange token page. */
router.get('/token', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET exchange nft page. */
router.get('/nft', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

/* GET exchange collection page. */
router.get('/collection', function (req, res, next) {
  // to complete
  res.send('route not implemented yet')
})

// export the required modules
module.exports = router
