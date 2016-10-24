var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();
var bcrypt = require('bcrypt');
var auth = require('../util/auth.js');
const saltRounds = 10;
const usernameMinLength = 5;
const usernameMaxLength = 16;
const passwordMinLength = 8;
const passwordMaxLength = 16;


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
});

/* POST login {"username":"user","password": "password"} */
router.post('/login', auth.authenticate(), function(req, res, next) {
  return res.status(200).json({"logged in: ": "true"});
});


/* POST register {"username":"user","password": "password"} */
router.post('/register', function(req, res, next) {
  req.checkBody('username', 'Username is missing').notEmpty();
  req.checkBody('password', 'Password is missing').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({"err": "Validation errors"});
  }

  if (req.body.username.length < usernameMinLength || req.body.username.length > usernameMaxLength) {
    return res.status(400).json({"err": "Username must be atleast " + usernameMinLength + 
      " characters long and a maximum of " + usernameMaxLength + " characters"});
  }

  if (req.body.password.length < passwordMinLength || req.body.password.length > passwordMaxLength) {
    return res.status(400).json({"err": "Password must be atleast " + passwordMinLength + 
      " characters long and a maximum of " + passwordMaxLength + " characters"});
  }

  // check if a user exists
  db.any("SELECT username     " +
         "FROM Users          " +
         "WHERE username = $1;",
         [req.body.username])
  .then(function (data) {
    if (data.length >= 1) {
      return res.status(409).json({"err": "Username already exists"});
    }
    //hash the user's password
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        if (err) { return res.status(409).json({"error": err}); }
        db.none("INSERT INTO Users (Username, password)" + 
                " VALUES ($1, $2);                     ",
                [req.body.username, hash])
        .then(function () {
          return res.sendStatus(200);
        })
        .catch(function (err) {
          return res.status(400).json({'err': err});
        });
      });
    });
  })
  .catch(function (err) {
    console.log(err);
  });
});

module.exports = router;