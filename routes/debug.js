var express = require('express');
var router = express.Router();

/* GET a "debug" display which shows a 3-up of each display mode */
router.get('/', function(req, res, next) {
  res.render('debug', { title: '3-Up Testing Display' });
});

router.get('/data', function(req, res, next) {
  res.render('data-dump', { title: 'Data Dump' });
});


module.exports = router;
