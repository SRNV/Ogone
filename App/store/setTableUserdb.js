import pool from 'pool';
export default function() {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id_user SERIAL PRIMARY KEY,
      firstname VARCHAR(30) NOT NULL,
      lastname VARCHAR(30) NOT NULL
      );
  `)
};