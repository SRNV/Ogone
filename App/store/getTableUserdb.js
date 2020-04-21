const pool = require('./pool');
module.exports = function() {
  return pool.query(`
    SELECT * FROM users
  `.trim());
};