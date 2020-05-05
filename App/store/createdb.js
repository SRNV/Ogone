import pool from './pool';
function createDB(name) {
  return pool.query('CREATE DATABASE demo')
}
export default createDB;