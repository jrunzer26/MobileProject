var bcrypt = require('bcrypt');
var pgp = require('pg-promise')();
var basicAuth = require('basic-auth');

var db = pgp("postgres://jason:mobile@localhost:5432/mobile");


exports.authenticate = function () {
  return function(req, res, next) {
    var credentials = basicAuth(req);
    if (!credentials) {
      return res.status(401).json({ "err": "Credentials missing"});
    }
    var username = credentials.name;
    var password = credentials.pass;
    console.log(username + " " + password);
    db.one("SELECT username, password " +
         "FROM Users                " +
         "WHERE username = $1;",
         [username])
    .then(function(data) {
    if(data.username == undefined) {
      console.log("undefined");
      return res.status(400).json({"err": "Username or password is incorrect."})
    }
    //username exists, check password
    bcrypt.compare(password, data.password, function(err, result) {
      if (err) {return res.status(409).json({"err": err})}
      if (result == false) {
        return res.status(400).json({"err": "Username or password is incorrect."});
      }
      });
    })
    .catch(function(err) {
      return res.status(400).json({"err": "Username or password is incorrect."});
    });
    console.log("hello");
    next();
  }
}