const express = require('express');
const { isLoggedIn } = require('../login');
const router = express.Router()

/* GET friendlist page.
*/
router.get('/', isLoggedIn, function (req, res, next) {
    if (req.accepts('html')) {
        res.status(200);
        res.render('friendlist');
    } else {
        req.send(406);
    }
})

// export the required modules
module.exports = router
