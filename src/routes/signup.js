const express = require('express')
const router = express.Router()
const { isLoggedOut, hashUserPassword } = require('../login');
const models = require('../models');
const User = require('../models/user');
const { generateIdenticon } = require('../identicon');
 
router.get('/', isLoggedOut, (req, res) => {
    const response = {
        title: 'Signup',
        error: req.query ? req.query.error : ''
    }
    res.render('signup', response);
});

router.post('/', isLoggedOut, async (req, res) => {
    const emailTaken = (await User.findOne({ email: req.body.email })) !== null;
    if (emailTaken) {
        res.redirect('/signup?error=emailTaken');
        return;
    }

    const usernameTaken = (await User.findOne({ username: req.body.username })) !== null;
    if (usernameTaken) {
        res.redirect('/signup?error=usernameTaken');
        return;
    }

    const passwordsMatch = req.body.password === req.body.retype_password;
    if (!passwordsMatch) {
        res.redirect('/signup?error=passwordsDontMatch');
        return;
    }

    let user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        ppic: generateIdenticon(req.body.username, Date.now())
    };

    user = await hashUserPassword(user);
    User.create(user).then(result => {
        if (result.error) {
            res.redirect(`/login/signup?error=${result.error}`);
        } else { res.redirect('/login'); }
    });
});

module.exports = router;
