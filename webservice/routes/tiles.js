var express = require('express');
var router = express.Router();
var auth = require('../util/auth.js');
var pgp = require('pg-promise')();

var db = pgp("postgres://jason:mobile@localhost:5432/mobile");
/* POST get users stats. 
	{"username":"username"*/
router.post('/', auth.authenticate(), function(req, res, next) {
  db.any('SELECT "gold", "food", "tiles",            ' + 
        '"tilesTaken", "goldObtained", "foodObtained"' +
         "FROM Users                                 " +
         "WHERE username = $1;                       ",
         [req.body.username])
  .then(function (data) {
    if (data.length < 1) {
      return res.status(409).json({"err": "Username does not exist"});
    }
    return res.status(200).json({"gold": data[0].gold,
      "food": data[0].food,
      "tiles": data[0].tiles,
      "tilesTaken": data[0].tilesTaken,
      "goldObtained": data[0].goldObtained,
      "foodObtained": data[0].foodObtained,
    });
  })
  .catch(function (err) {
    console.log(err);
    return res.status(409).json({"err": "error"});
  });
});

module.exports = router;