const express = require('express')
const router = express.Router()
const { passport, isLoggedOut } = require('../login');
const eventBus = require('../eventBus');

router.get('/', isLoggedOut, (req, res) => {
    const response = {
        title: 'Login',
        error: req.query.error
    }
    res.render('login', response);
});

router.post('/', isLoggedOut, (req, res, next) => { 
    console.log('user logged in route /login');
    eventBus.emit('user.login')
    next();
},
passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
}));

module.exports = router;
