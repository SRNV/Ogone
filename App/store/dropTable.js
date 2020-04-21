const pool = require('./pool');
module.exports = function(table) {
  return pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
};