const pool = require('./pool');
module.exports = function({ firstname, lastname}) {
  return pool.query(`
    INSERT INTO users (firstname, lastname) VALUES ($1, $2)
  `, [firstname, lastname])
}