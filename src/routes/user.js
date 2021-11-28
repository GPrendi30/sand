var express = require('express');
var router = express.Router();

/* GET user page. */
router.get('/', function (req, res, next) {
    res.render('user');
});

/* GET user settings page. */
router.get('/settings', function (req, res, next) {
    // to complete
});

/* GET user assets page. */
router.get('/assets', function (req, res, next) {
    // to complete
});

/* GET user friends page. */
router.get('/friends', function (req, res, next) {
    // to complete
});

/* GET user recently viewed assets page. */
router.get('/recently_viewed', function (req, res, next) {
    // to complete
});

/* GET user following. */
router.get('/following', function (req, res, next) {
    // to complete
});

/* GET user edit page. */
router.get('/edit', function (req, res, next) {
    // to complete
});


// export the required modules
module.exports = router;