var pgp = require('pg-promise')();
var db = pgp("postgres://jason:mobile@localhost:5432/mobile");

exports.createTile = function (tileID, username) {
	console.log("start");
	var goldGen = Math.floor(Math.random() * 5);
	var foodGen = Math.floor(Math.random() * 5);
	console.log("gold " + goldGen + " food: " + foodGen);
	console.log("tile id" + tileID);
	console.log("username " + username);
	console.log("insert");
	db.none('INSERT INTO Tiles ("tileID", "gold", "food", "username")' +
		"VALUES ($1,$2,$3,$4);",
		[tileID, goldGen, foodGen, username])
	.then(function () {
		console.log("parse");
		var json = {"gold": goldGen, "food": foodGen};
		console.log("json gold " + json.gold);
		return 5;
	})
	.catch(function(err) {
		console.log("hello");
		console.log(err);
		return JSON.parse({"error": err});
	});
	

}
var tilePush = function(tile, tileInfo) {
  console.log(tile);
    console.log(tile.tileID);
    console.log("tile info" + tileInfo);
    db.any('SELECT "gold", "food", "username"' + 
         "FROM Tiles           " +
         'WHERE "tileID" = $1; ',
         [tile.tileID])
    .then(function (data) {
      if (data.length < 1) {
        var goldGen = Math.floor(Math.random() * 5);
        var foodGen = Math.floor(Math.random() * 5);
        db.none('INSERT INTO Tiles ("tileID", "gold", "food")' +
          "VALUES ($1,$2,$3);",
          [tile.tileID, goldGen, foodGen])
        .then(function () {
          tileInfo.tiles.push({"gold": goldGen, "food": foodGen, "username": "null"});
          console.log(tileInfo);
        })
        .catch(function(err) {
          console.log(err);
          return res.status(409).json({"err": "there was an internal error with resources"});
        });
      } else {
        tileInfo.tiles.push({"gold": data[0].gold, "food": data[0].food, "username": data[0].username});
        //console.log(tileInfo);
      }
      console.log("testing");
    })
    .catch(function (err) {
      console.log(err);
      return res.status(409).json({"err": "error getting tile resources"});
    });
    //console.log(tileInfo);
    console.log("end of for loop")
}

exports.tileArrayGetter = function() {
	console.log("in array getter");

	return function(req, res, next) {
		console.log("in function");
		var tiles = {tiles: []};
		console.log(req.body.tiles);
		console.log(req.body.tiles.length);
		for(var i = 0; i < req.body.tiles.length; i++) {
			var reqTile = req.body.tiles[i];
			console.log("tile id: " + reqTile.tileID);
			tiles.tiles.push({id: reqTile.tileID});
			db.any('SELECT "gold", "food", "username"' + 
		         "FROM Tiles           " +
		         'WHERE "tileID" = $1; ',
		         [reqTile.tileID])
		    .then(function (data) {
		      if (data.length < 1) {
		        var goldGen = Math.floor(Math.random() * 5);
		        var foodGen = Math.floor(Math.random() * 5);
		        db.none('INSERT INTO Tiles ("tileID", "gold", "food")' +
		          "VALUES ($1,$2,$3);",
		          [reqTile.tileID, goldGen, foodGen])
		        .then(function () {
		          tiles.tiles.push({"id": reqTile.tileID, "gold": goldGen, "food": foodGen, "username": "null"});
		          console.log(tiles);
		          if (i + 1 == req.body.tiles.length) {
			    	res.locals.tiles = tiles;
			    	next();
		      	  }
		        })
		        .catch(function(err) {
		          console.log(err);
		        });
		      } else {
		        tiles.tiles.push({"id": reqTile.tileID, "gold": data[0].gold, "food": data[0].food, "username": data[0].username});
		        console.log(tiles);
		        if (i + 1 == req.body.tiles.length) {
			    	res.locals.tiles = tiles;
			    	next();
		      	}
		      }
		      console.log("testing");
		      if (i + 1 == req.body.tiles.length) {
		    	res.locals.tiles = tiles;
		    	next();
		      }
		    })
		    .catch(function (err) {
		      console.log(err);
		      return res.status(409).json({"err": "error getting tile resources"});
		    });
		    //console.log(tileInfo);
		    console.log("end of for loop")
		    tiles.tiles.push({id: 5});
		    
		}
	}
}