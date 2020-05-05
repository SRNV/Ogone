import pool from './pool';
export default function(table) {
  return pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
};