const express = require('express')
const router = express.Router()
const { passport, isLoggedOut } = require('../login');

router.get('/', isLoggedOut, (req, res) => {
    const response = {
        title: 'Login',
        error: req.query.error
    }
    res.render('login', response);
});

router.post('/', isLoggedOut, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
}));

module.exports = router;
