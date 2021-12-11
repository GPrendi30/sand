const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/home');
})

router.get('/home', function (req, res, next) {
    if (req.accepts('html')) {
        res.render('index', { title: 'S.A.N.D' })
    } else {
        res.status(406).end();
    }
})


// export the required modules
module.exports = router;
