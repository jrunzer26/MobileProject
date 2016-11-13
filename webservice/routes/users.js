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

/* POST Add resources to user */
router.post('/add', auth.authenticate(), function(req, res, next) {
  db.none('UPDATE Users                          ' +
         'SET "gold" = "gold" + $1,              ' +
         '  "food" = "food" + $2,                ' +
         '  "goldObtained" = "goldObtained" + $1,' +
         '  "foodObtained" = "foodObtained" + $2 ' + 
         'WHERE "username" = $3;                 ',
         [req.body.gold, req.body.food, req.body.username])
  .catch(function (err) {
    console.log(err);
    return res.status(409).json(err);
  });
  return res.status(200).json({"success": "add"});
});

/* POST Subtract resources from user */
router.post('/subtract', auth.authenticate(), function(req, res, next) {
  db.none('UPDATE Users ' +
         'SET "gold" = "gold" - $1, "food" = "food" - $2' + 
         'WHERE "username" = $3;',
         [req.body.gold, req.body.food, req.body.username])
  .catch(function (err) {
    console.log(err);
    return res.status(409).json(err);
  });
  return res.status(200).json({"success": "subtract"});
});
module.exports = router;

/* POST Collect Resources */
router.post('/collect', auth.authenticate(), function(req, res, next) {
  db.any('SELECT "goldObtained", "foodObtained" ' +
        'FROM Users ' + 
        'WHERE "username" = $1;',
        [req.body.username])
  .then(function(data) {
    db.none('UPDATE Users ' +
          'SET "goldObtained" = "goldObtained" - $2, ' +
          '"foodObtained" = "foodObtained" - $3 ' +
          'WHERE "username" = $1;',
          [req.body.username, data[0].goldObtained, data[0].foodObtained])
    .catch(function(error) {
      console.log(error);
    });
    res.status(200).json({goldObtained: data[0].goldObtained, foodObtained: data[0].foodObtained});
  })
  .catch(function(err) {
    console.log(err);
  });
});
