const express = require('express')
const router = express.Router()

/* GET discover page. */
router.get('/', function (req, res, next) {
    if (req.accepts('html')) {
        res.render('discover');
    } else {
        res.status(406).end();
    }
})

// export the required modules
module.exports = router
