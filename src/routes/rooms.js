const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router()

/* GET exchange page. */
router.get('/', isLoggedIn, function (req, res, next) {
    res.render('wip')
})

module.exports = router;
