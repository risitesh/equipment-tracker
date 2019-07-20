var express = require('express');
var router = express.Router();

/* GET equipment page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: "Equipment", query: req.query });
});

router.get('/create', function (req, res, next) {
    res.render('equipment-create', {title: "Equipment"});
});

module.exports = router;