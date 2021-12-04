const express = require('express')
const router = express.Router()
const { passport, isLoggedOut, hashUserPassword } = require('../login');
const models = require('../models').model;

router.get('/', isLoggedOut, (req, res) => {
    const response = {
        title: 'Signup',
        error: req.query ? req.query.error : ''
    }
    res.render('signup', response);
});

router.post('/', isLoggedOut, async (req, res) => {
    let user = { username: req.body.username, password: req.body.password, email: req.body.email };
    user = await hashUserPassword(user);
    models.users.insertOne(user).then(result => {
        if (result.error) {
            res.redirect(`/login/signup?error=${result.error}`);
        } else { res.redirect('/login'); }
    });
});



module.exports = router;
