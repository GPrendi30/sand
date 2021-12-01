const express = require('express')
const { isLoggedOut } = require('../login')
const router = express.Router()
const { passport } = require('../login');

router.get('/', isLoggedOut, (req, res) => {
    const response = {
        title: 'Login',
        error: req.query.error
    }
    res.render('login', response);
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
}));
