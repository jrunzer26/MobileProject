var pg = require('pg');
//or native libpq bindings
//var pg = require('pg').native

var conString = process.env.ELEPHANTSQL_URL || "postgres://ceketaqf:VWxiB8P55SIoY7mM1UbwvmKgR0KJQ7nt@tantor.db.elephantsql.com:5432/ceketaqf";

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * FROM users', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].username);
    client.end();
  });
});