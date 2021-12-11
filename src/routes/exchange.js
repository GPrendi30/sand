const express = require('express')
const router = express.Router()

/* GET exchange page. */
router.get('/', function (req, res, next) {
    res.render('wip')
})

/* GET exchange token page. */
router.get('/token', function (req, res, next) {
    // to complete
    res.render('wip')
})

/* GET exchange nft page. */
router.get('/nft', function (req, res, next) {
    // to complete
    res.render('wip')
})

/* GET exchange collection page. */
router.get('/collection', function (req, res, next) {
    // to complete
    res.render('wip')
})

// export the required modules
module.exports = router
