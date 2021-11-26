var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'S.A.N.D' });
});

/* GET graph page. */ 
router.get('/graph/', function(req, res, next) {
  res.render('graph');
});

/* GET the graph types. */ 
router.get('/graph/types', function(req, res, next) {
  // to complete
});

/* GET the graph data types. */ 
router.get('/graph/data_type', function(req, res, next) {
  // to complete
});

/* GET the graph period. */ 
router.get('/graph/period', function(req, res, next) {
  // to complete
});

/* GET the transactions graph. */ 
router.get('/graph/transaction', function(req, res, next) {
  // to complete
});

/* GET chat page. */ 
router.get('/chat/', function(req, res, next) {
  res.render('chat');
});

/* GET user page. */ 
router.get('/user/', function(req, res, next) {
  res.render('user');
});

/* GET user settings page. */ 
router.get('/user/settings', function(req, res, next) {
  // to complete
});

/* GET user assets page. */ 
router.get('/user/assets', function(req, res, next) {
  // to complete
});

/* GET user friends page. */ 
router.get('/user/friends', function(req, res, next) {
  // to complete
});

/* GET user recently viewed assets page. */ 
router.get('/user/recently_viewed', function(req, res, next) {
  // to complete
});

/* GET user following. */ 
router.get('/user/following', function(req, res, next) {
  // to complete
});

/* GET user edit page. */ 
router.get('/user/edit', function(req, res, next) {
  // to complete
});

/* GET exchange page. */ 
router.get('/exchange/', function(req, res, next) {
  res.render('exchange');
});

/* GET exchange token page. */ 
router.get('/exchange/token', function(req, res, next) {
  // to complete
});

/* GET exchange nft page. */ 
router.get('/exchange/nft', function(req, res, next) {
 // to complete
});

/* GET exchange collection page. */ 
router.get('/exchange/collection', function(req, res, next) {
  // to complete
});

// export the required modules
module.exports = router;
