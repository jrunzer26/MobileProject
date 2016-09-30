var pg = require('pg');
connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/mobile';

client = new pg.Client(connectionString);
client.connect();