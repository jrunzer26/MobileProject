var pgp = require('pg-promise')();
var db = pgp("postgres://jason:mobile@localhost:5432/mobile");
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.second = 0;



	

	
var j = schedule.scheduleJob(rule, function() {
	db.any('SELECT "username" FROM Users;')
	.then(function(data) {
		console.log("hello");
		console.log(data.length);
		for(var i = 0; i < data.length; i++) {
			console.log(data[i]);
			var username = data[i].username;
			console.log("username: " + username);
			db.any('SELECT "gold", "food" ' +
					'FROM Tiles ' +
					'WHERE "username" = $1;',
					[data[i].username]
			)
			.then(function(tileData) {
				console.log(tileData);
				console.log("username: " + username);
				for(var j = 0; j < tileData.length; j++) {
					console.log(tileData[j]);
					console.log("username: " + username);
					db.none('UPDATE Users                                    ' +
							'SET "goldObtained" = "goldObtained" + $1,       ' +
							'"foodObtained" = "foodObtained" + $2,           ' +
							'"totalGoldObtained" = "totalGoldObtained" + $1, ' +
							'"totalFoodObtained" = "totalFoodObtained" + $2, ' +
							'"gold" = "gold" + $1,                           ' +
							'"food" = "food" + $2                            ' +
							'WHERE "username" = $3;                          ',
							[tileData[j].gold, tileData[j].food, username])
					.catch(function(someError) {
						console.log(someError);
					});
				}
				db.any('SELECT * FROM Users;')
					.then(function(data) {
						console.log("hello");
						console.log(data[0]);
					})
					.catch(function(error) {
						console.log(error);
					});
			})
			.catch(function(error) {
				console.log(error);
			});
		}
	})
	.catch(function(err) {
		console.log(err);
	});

});