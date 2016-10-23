var express = require('express');
var router = express.Router();
var auth = require('../util/auth.js');
var pgp = require('pg-promise')();

var db = pgp("postgres://jason:mobile@localhost:5432/mobile");
/* GET users listing. */
router.get('/', auth.authenticate(), function(req, res, next) {
  res.status(200).json({"hello": err});
});

module.exports = router;
