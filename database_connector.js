var postgresdb = require('pg');
const pool = new postgresdb.Client({
  "host"     : process.env.RDS_HOSTNAME,
  "user"     : process.env.RDS_USERNAME,
  "password" : process.env.RDS_PASSWORD,
  "port"     : process.env.RDS_PORT,
});

pool.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});

// pool.end();
exports.db_connection = pool