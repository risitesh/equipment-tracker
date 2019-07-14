var express = require('express');
var router = express.Router();

/* GET equipment page. */
router.get('/', function (req, res, next) {
    res.send('in equipment');
});

module.exports = router;
