const express = require('express')
const router = express.Router()

/* GET exchange page. */
router.get('/', function (req, res, next) {
    res.render('wip')
})

module.exports = router;
