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
    const emailTaken = (await models.users.findOne({ email: req.body.email })) !== null;
    if (emailTaken) {
        res.redirect('/signup?error=emailTaken');
        return;
    }

    const usernameTaken = (await models.users.findOne({ username: req.body.username })) !== null;
    if (usernameTaken) {
        res.redirect('/signup?error=usernameTaken');
        return;
    }

    const passwordsMatch = req.body.password === req.body.retype_password;
    if (!passwordsMatch) {
        res.redirect('/signup?error=passwordsDontMatch');
        return;
    }

    let user = createUser(
        req.body.username, 
        req.body.password, 
        req.body.email, 
        req.body.name,
        req.body.surname);

    user = await hashUserPassword(user);
    models.users.insertOne(user).then(result => {
        if (result.error) {
            res.redirect(`/login/signup?error=${result.error}`);
        } else { res.redirect('/login'); }
    });
});


function createUser (username, password, email, name, surname) {
    return {
        username,
        password,
        email,
        name,
        surname,
        friendlist: [],
        ppic: '', // autogenerated
        bio: '',
        tracking: [],
        recentlyviewed: []
    }; // will be updated by the user schema of mongoose in M3
}
module.exports = router;
