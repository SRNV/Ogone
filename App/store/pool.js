import p from 'pg';
const { Pool } = p;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'demo',
  password: '243974zertyu13',
  port: 5000,
});
export default pool;