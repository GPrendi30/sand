const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const models = require('./models').model;
const ObjectID = require('mongodb').ObjectID;

/**
 * Serializes a user object to a session.
 */
passport.serializeUser((user, done) => {
    done(null, user._id);
})

/**
 * Deserialize user from a session to a user object.
 */
passport.deserializeUser((id, done) => {
    const filter = { _id: new ObjectID(id) };
    models.users.findOne(filter, (err, res) => {
        done(err, res);
    });
})

/**
 * Middleware to check if user is logged in.
 * @param {object} req request object
 * @param {object} res response object
 * @param {function} next next function
 * @result Delegated request to next function if user is logged in, else redirects to login page.
 * // TODO test when extending routes
 */
function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login'); // redirect to login page
}

/**
 * Middleware to check if user is logged in.
 * @param {object} req request object
 * @param {object} res response object
 * @param {function} next next function
 * @result Delegated request to next function if user is logged in,
 * and the logged in user has the same id as the params of the request
 * else redirects to login page.
 * // TODO test when extending routes
 */
function isLoggedInSpecialized (req, res, next) {
    if (req.isAuthenticated() && req.session.passport.user === req.params._id) return next();

    if (req.isAuthenticated()) {
        return res.status(403).send('Forbidden');
    }
    // redirect to login page.
    // if logged in with another account, login will bubble up(redirect) to home
    res.redirect('/login');
}


/**
 * Middleware to check if user is not logged in.
 * @param {object} req request object
 * @param {object} res response object
 * @param {function} next next function
 * @result Delegates request to next function if user is not logged in, else redirects to home page.
 * // TODO test when extending routes
 */
function isLoggedOut (req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/'); // redirect to home page
}

/**
 * Receives a user object and returns a user object with the password field updated with a hash.
 * @param {object} user a user Object
 * @param {function} next the next function
 */
async function hashUserPassword (user) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);    // generate salt for the password
    const hash = await bcrypt.hash(user.password, salt); // hash the password

    return { ...user, password: hash };
}

/**
 * Strategy for local authentication.
 */
passport.use(new LocalStrategy(function (username, password, done) {
    models.users.findOne({ username: username }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });

        // authenticate user
        bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err);
            if (res === false) return done(null, false, { message: 'Incorrect password.' });

            return done(null, user);
        });
    });
}));

// TODO update the routes with the new authentication

exports.passport = passport;
exports.isLoggedIn = isLoggedIn;
exports.isLoggedOut = isLoggedOut;
exports.isLoggedInSpecialized = isLoggedInSpecialized;
exports.hashUserPassword = hashUserPassword;
