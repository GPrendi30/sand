const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router()

/* GET follow page page.
    Will be extended
*/
router.get('/', isLoggedIn, function (req, res, next) {
    if (req.accepts('html')) {
        res.status(200);
        res.render('follow');
    } else {
        req.send(406);
    }
})

// export the required modules
module.exports = router
