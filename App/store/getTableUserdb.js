import pool from 'pool';
export default function() {
  return pool.query(`
    SELECT * FROM users
  `.trim());
};