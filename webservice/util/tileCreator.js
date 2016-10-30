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