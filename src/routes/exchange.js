var express = require('express');
var router = express.Router();

/* GET exchange page. */
router.get('/', function (req, res, next) {
    res.render('exchange');
});

/* GET exchange token page. */
router.get('/token', function (req, res, next) {
    // to complete
});

/* GET exchange nft page. */
router.get('/nft', function (req, res, next) {
    // to complete
});

/* GET exchange collection page. */
router.get('/collection', function (req, res, next) {
    // to complete
});

// export the required modules
module.exports = router;