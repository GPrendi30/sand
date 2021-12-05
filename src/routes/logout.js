const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../login');

router.get('/', isLoggedIn, function (req, res) {
    req.logout();
    res.redirect('/login');
});

module.exports = router;
