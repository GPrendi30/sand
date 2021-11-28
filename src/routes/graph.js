const express = require('express')
const router = express.Router()

/* GET graph page. */
router.get('/', function (req, res, next) {
  res.render('graph')
})

/* GET the graph types. */
router.get('/types', function (req, res, next) {
  // to complete
})

/* GET the graph data types. */
router.get('/data_type', function (req, res, next) {
  // to complete
})

/* GET the graph period. */
router.get('/period', function (req, res, next) {
  // to complete
})

/* GET the transactions graph. */
router.get('/transaction', function (req, res, next) {
  // to complete
})

// export the required modules
module.exports = router
