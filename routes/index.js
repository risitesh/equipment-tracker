var express = require('express');
var router = express.Router();

/* GET equipment page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Equipment Tracker' });
});

module.exports = router;
