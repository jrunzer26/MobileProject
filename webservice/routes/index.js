var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();

var cn = {
  host: 'localhost',
  port: 5433,
  database: 'mobile',
  user: 'jason',
  password: 'mobile'
};


var db = pgp("postgres://jason:mobile@localhost:5432/mobile");

/* GET home page. */
router.get('/', function(req, res, next) {
  db.any("SELECT * FROM Users")
    .then(function (data) {
      console.log(data);
      res.json(data);
      
    })
    .catch(function (err) {
      console.log(err);
    });
    //res.render('index', { title: 'hello' });
  
});

module.exports = router;
