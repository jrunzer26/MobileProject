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
exports.tileArrayGetter = function() {
	console.log("in array getter");

	return function(req, res, next) {
		console.log("in function");
		var tiles = {tiles: []};
		console.log(req.body.tiles);
		console.log(req.body.tiles.length);
		for(var i = 0; i < req.body.tiles.length; i++) {
			var reqTile = req.body.tiles[i];
			console.log(reqTile);
			db.any('SELECT "gold", "food", "username"' + 
		         "FROM Tiles           " +
		         'WHERE "tileLatID" = $1 AND "tileLngID" = $2;',
		         [reqTile.tileLatID, reqTile.tileLngID])
		    .then(function (data) {
		      if (data.length < 1) {
		      	console.log("creating new tile");
		      	console.log(reqTile.tileLatID + " " + reqTile.tileLngID);
		        var goldGen = Math.floor(Math.random() * 5);
		        var foodGen = Math.floor(Math.random() * 5);
		        db.none('INSERT INTO Tiles ("tileLatID", "tileLngID", "gold", "food")' +
		          "VALUES ($1,$2,$3,$4);",
		          [reqTile.tileLatID, reqTile.tileLngID, goldGen, foodGen])
		        .then(function () {
		          tiles.tiles.push({"tileLatID": reqTile.tileLatID, "tileLngID": reqTile.tileLngID, 
		          	"gold": goldGen, "food": foodGen, "username": "null"});
		          console.log(tiles);
		        })
		        .catch(function(err) {
		          console.log(err);
		        });
		      } else {
		        tiles.tiles.push({"tileLatID": reqTile.tileLatID, "tileLngID": reqTile.tileLngID, "gold": data[0].gold, "food": data[0].food, "username": data[0].username});
		        console.log(tiles);
		      }
		      console.log("testing");
		    })
		    .catch(function (err) {
		      console.log(err);
		      return res.status(409).json({"err": "error getting tile resources"});
		    });
		    console.log("end of for loop")
		    if (i +1 == req.body.tiles.length) {
		    	res.locals.tiles = tiles;
		    	next();
		    }
		}
	}
}