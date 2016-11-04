var express = require('express');
var router = express.Router();
var auth = require('../util/auth.js');

var pgp = require('pg-promise')();

var db = pgp("postgres://jason:mobile@localhost:5432/mobile");


/* POST get a tile's resources, creates a tile if it doesn't exist
	{"tileID":"tileid", "username": "username"}*/
router.post('/resources', auth.authenticate(), function(req, res, next) {
  db.any('SELECT "gold", "food", "username"' + 
         "FROM Tiles           " +
         'WHERE "tileID" = $1; ',
         [req.body.tileID])
  .then(function (data) {
    if (data.length < 1) {
      var goldGen = Math.floor(Math.random() * 5);
      var foodGen = Math.floor(Math.random() * 5);
      db.none('INSERT INTO Tiles ("tileID", "gold", "food")' +
        "VALUES ($1,$2,$3);",
        [req.body.tileID, goldGen, foodGen])
      .then(function () {
        return res.status(200).json({"gold": goldGen, "food": foodGen, "username": "null"});
      })
      .catch(function(err) {
        console.log(err);
        return res.status(409).json({"err": "there was an internal error with resources"});
      });
    } else {
      return res.status(200).json({"gold": data[0].gold, "food": data[0].food, "username": data[0].username});
    }
  })
  .catch(function (err) {
    console.log(err);
    return res.status(409).json({"err": "error getting tile resources"});
  });
});


/* POST capture a tile
  {"tileID": tileID, "username": username}
*/
router.post('/capture', auth.authenticate(), function(req, res, next) {
  console.log(req.body.username + " " + req.body.tileID);
  db.none('UPDATE Tiles                         ' +
         'SET "username" = $1              ' +
         'WHERE "tileID" = $2;',
        [req.body.username, req.body.tileID])
  .then(function (data) {
    //get the resources
    db.any('SELECT "gold", "food", "username"' + 
         "FROM Tiles           " +
         'WHERE "tileID" = $1; ',
         [req.body.tileID])
    .then(function(tileData) {
      return res.status(409).json({"gold": tileData[0].gold, "food": tileData[0].food, "username": tileData[0].username});
    })
    .catch(function (err) {
      return res.status(409).json({"err": "error getting tile resources"});
    });
  })
  .catch(function(err) {
    console.log(err);
    return res.status(409).json({"err": "error capturing tile"})
  });
});

module.exports = router;