var express = require('express');
var router = express.Router();

/* GET home page: the view for participants. */
router.get('/', function(req, res, next) {
  res.render('present', { title: 'Projector Display' });
});

module.exports = router;
