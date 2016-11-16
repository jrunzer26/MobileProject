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
  db.any('SELECT "gold", "food", "username", "soldiers"' + 
         "FROM Tiles           " +
         'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
         [req.body.tileLatID, req.body.tileLngID])
    .then(function (data) {
      if (data.length < 1) {
        console.log("creating new tile");
        console.log(req.body.tileLatID + " " + req.body.tileLngID);
        var goldGen = Math.floor(Math.random() * 5);
        var foodGen = Math.floor(Math.random() * 5);
        db.none('INSERT INTO Tiles ("tileLatID", "tileLngID", "gold", "food", "soldiers")' +
          "VALUES ($1,$2,$3,$4,$5);",
          [req.body.tileLatID, req.body.tileLngID, goldGen, foodGen, 0])
        .then(function () {
          res.status(200).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, 
            "gold": goldGen, "food": foodGen, "username": "null", "soldiers": "0"});
        })
        .catch(function(err) {
          console.log(err);
        });
      } else {
        res.status(200).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, "gold": data[0].gold, "food": data[0].food, "username": data[0].username, "soldiers": data[0].soldiers});
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

  db.any('SELECT "username" ' +
         'FROM Tiles ' +
         'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
         [req.body.tileLatID, req.body.tileLngID])
  .then(function(usernameData) {
    console.log("username data: " + usernameData[0].username);
    if(usernameData[0].username != null) {
      console.log("in not null");
       db.none('UPDATE Users ' +
           'SET "tiles" = "tiles" - 1 ' +
           'WHERE "username" = $1',
           [usernameData[0].username])
      .catch(function(err) {
        console.log("error subtracting tiles: " + err);
      });
    }
    db.none('UPDATE Users ' +
           'SET "tiles" = "tiles" + 1, ' +
           '"tilesTaken" = "tilesTaken" + 1 ' +
           'WHERE "username" = $1',
           [req.body.username])
    .catch(function(err) {
      console.log("error updating user tile: " + err);
    });
    db.none('UPDATE Tiles                         ' +
           'SET "username" = $1              ' +
           'WHERE "tileLatID" = $2 AND "tileLngID" = $3;',
          [req.body.username, req.body.tileLatID, req.body.tileLngID])
    .then(function (data) {
      //get the resources
      db.any('SELECT "gold", "food", "username", "soldiers"' + 
           "FROM Tiles           " +
           'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
           [req.body.tileLatID, req.body.tileLngID])
      .then(function(tileData) {
        return res.status(200).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, "gold": tileData[0].gold, 
          "food": tileData[0].food, "username": tileData[0].username, "soldiers": tileData[0].soldiers});
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
    })
    .catch(function(error) {
      console.log("error getting username" + error);
    });
});

/* POST purchace the soldiers for a tile */
/* {"username": username, "soldiers": 5, "tileLatID": tileLatID, "tileLngID": tileLngID}*/
router.post('/purchace-soldiers', auth.authenticate(), function(req, res, next) {
  // check if the user is the owner of the tile
  var requestedSoldiers = req.body.soldiers;
  console.log(requestedSoldiers);
  db.any('SELECT "username" ' +
         'FROM Tiles ' +
         'WHERE "tileLatID" = $1 AND "tileLngID" = $2 AND "username" = $3;',
         [req.body.tileLatID, req.body.tileLngID, req.body.username])
  .then(function(usernameData) {
    console.log("username data: " + usernameData[0].username);
    if(usernameData.length > 0) {
      db.any('SELECT "gold" ' +
        'FROM Users ' +
        'WHERE "username" = $1;',
        [req.body.username])
      .then(function(goldData) {
        if (goldData.length > 0) {
          var cost = requestedSoldiers * 10;
          console.log("cost: " + cost);
          var subtractedGold = goldData[0].gold - cost;
          console.log("subtracted gold: " + subtractedGold);
          if (subtractedGold > 0) {
            db.none('UPDATE Users ' +
              'SET "totalSoldiers" = "totalSoldiers" + $1, ' +
              '"gold" = $2 ' +
              'WHERE "username" = $3;',
              [requestedSoldiers, subtractedGold, req.body.username])
            .catch(function(err) {
              console.log(err);
            });
            console.log("after update users");
            db.none('UPDATE Tiles ' +
              'SET "soldiers" = "soldiers" + $1 ' +
              'WHERE "tileLatID" = $2 AND "tileLngID" = $3;',
              [requestedSoldiers, req.body.tileLatID, req.body.tileLngID])
            .then(function(data) {
              db.any('SELECT "gold", "food", "username", "soldiers"' + 
                     "FROM Tiles           " +
                     'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
                     [req.body.tileLatID, req.body.tileLngID])
              .then(function(tileData) {
                return res.status(200).json({"tileLatID": req.body.tileLatID, "tileLngID": req.body.tileLngID, "gold": tileData[0].gold, 
                  "food": tileData[0].food, "username": tileData[0].username, "soldiers": tileData[0].soldiers});
              })
              .catch(function (err) {
                console.log(err);
                return res.status(409).json({"err": "error getting tile resources"});
              });
            })
            .catch(function(err) {
              console.log(err);
            });
          } else {
            return res.status(409).json({"err": "not enough funds"});
          }
        } else {
          return res.status(409).json({"err": "gold error"});
        }
      })
      .catch(function(err) {
        return res.status(409).json({"err": "error getting gold for verification"});
      });
    } else {
      return res.status(409).json({"err": "user does not own tile"});
    }
  })
  .catch(function(err) {
    console.log(err);
    return res.status(409).json({"err": " error"});
  });
});
  // check if the user has enough gold
  // purchace the soldiers
  // send back the updated tile.

/* POST remove some soldiers for a tile */
/* {"username": username, "soldiers": 5}*/
router.post('/remove-soldiers', auth.authenticate(), function(req, res, next) {

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