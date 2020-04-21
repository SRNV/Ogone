const pool = require('./pool');
module.exports = function() {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id_user SERIAL PRIMARY KEY,
      firstname VARCHAR(30) NOT NULL,
      lastname VARCHAR(30) NOT NULL
      );
  `)
};