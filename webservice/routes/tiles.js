var express = require('express');
var router = express.Router();
var auth = require('../util/auth.js');
var async = require('async');
var Pomise = require('promise');
var tileCreator = require('../util/tileCreator.js');

var pgp = require('pg-promise')();

var db = pgp("postgres://jason:mobile@localhost:5432/mobile");

var finishTiles = function (tileInfo, res) {
  console.log("end function");
  return res.status(200).json(tileInfo);
}

/* POST get a tile's resources, creates a tile if it doesn't exist
	{
    "tileLatID": "tileLatID",
    "tileLngID": "tileLatID",
  }
  */
router.post('/resources', auth.authenticate(), function(req, res, next) {
  console.log("gathering for : lat" + req.body.tileLatID + " " + req.body.tileLngID);
  db.any('SELECT "gold", "food", "username"' + 
         "FROM Tiles           " +
         'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
         [req.body.tileLatID, req.body.tileLngID])
    .then(function (data) {
      if (data.length < 1) {
        console.log("creating new tile");
        console.log(req.body.tileLatID + " " + req.body.tileLngID);
        var goldGen = Math.floor(Math.random() * 5);
        var foodGen = Math.floor(Math.random() * 5);
        db.none('INSERT INTO Tiles ("tileLatID", "tileLngID", "gold", "food")' +
          "VALUES ($1,$2,$3,$4);",
          [req.body.tileLatID, req.body.tileLngID, goldGen, foodGen])
        .then(function () {
          res.status(200).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, 
            "gold": goldGen, "food": foodGen, "username": "null"});
        })
        .catch(function(err) {
          console.log(err);
        });
      } else {
        res.status(200).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, "gold": data[0].gold, "food": data[0].food, "username": data[0].username});
      }
      console.log("testing");
    })
    .catch(function (err) {
      console.log(err);
      return res.status(409).json({"err": "error getting tile resources"});
    });
});


/* POST capture a tile
  {
    "tileLatID": "tileLatID",
    "tileLngID": "tileLatID",
    "username" : username
  }
*/
router.post('/capture', auth.authenticate(), function(req, res, next) {
  console.log(req.body.username + " " + req.body.tileLatID);
  db.none('UPDATE Tiles                         ' +
         'SET "username" = $1              ' +
         'WHERE "tileLatID" = $2 AND "tileLngID" = $3;',
        [req.body.username, req.body.tileLatID, req.body.tileLngID])
  .then(function (data) {
    //get the resources
    db.any('SELECT "gold", "food", "username"' + 
         "FROM Tiles           " +
         'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
         [req.body.tileLatID, req.body.tileLngID])
    .then(function(tileData) {
      return res.status(409).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, "gold": tileData[0].gold, "food": tileData[0].food, "username": tileData[0].username});
    })
    .catch(function (err) {
      console.log(err);
      return res.status(409).json({"err": "error getting tile resources"});
    });
  })
  .catch(function(err) {
    console.log(err);
    return res.status(409).json({"err": "error capturing tile"})
  });
});





/* POST get resouces of multiple tiles */
/*  {
  "username": "username",
  "tiles": [{
    "tileLatID": "tileLatID",
    "tileLngID": "tileLatID",
  }, {
    "tileLatID": "tileLatID",
    "tileLngID": "tileLatID",
  }]
}
*/
router.post('/multi-resources', auth.authenticate(), tileCreator.tileArrayGetter(),  function(req, res, next) {
  console.log("in multi resources");
  console.log(res.locals.tiles);
  return res.status(200).json(res.locals.tiles);
});



module.exports = router;