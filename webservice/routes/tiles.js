var express = require('express');
var router = express.Router();
var auth = require('../util/auth.js');
var tileCreator = require('../util/tileCreator.js')
var pgp = require('pg-promise')();

var db = pgp("postgres://jason:mobile@localhost:5432/mobile");
/* POST get a tile's resources
	{"tileID":"tileid", "username": "username"}*/
router.post('/resources', auth.authenticate(), function(req, res, next) {
  db.any('SELECT "gold", "food"' + 
         "FROM Tiles           " +
         'WHERE "tileID" = $1; ',
         [req.body.tileID])
  .then(function (data) {
    if (data.length < 1) {
      var goldGen = Math.floor(Math.random() * 5);
      var foodGen = Math.floor(Math.random() * 5);
      db.none('INSERT INTO Tiles ("tileID", "gold", "food", "username")' +
        "VALUES ($1,$2,$3,$4);",
        [req.body.tileID, goldGen, foodGen, req.body.username])
      .then(function () {
        return res.status(200).json({"gold": goldGen, "food": foodGen});
      })
      .catch(function(err) {
        return res.status(409).json({"error": err});
      });
    } else {
      return res.status(200).json({"gold": data[0].gold, "food": data[0].food});
    }
  })
  .catch(function (err) {
    console.log(err);
    return res.status(409).json({"err": "error"});
  });
});

module.exports = router;