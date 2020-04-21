const pool = require('./pool');
function createDB(name) {
  return pool.query('CREATE DATABASE demo')
}
module.exports = createDB;