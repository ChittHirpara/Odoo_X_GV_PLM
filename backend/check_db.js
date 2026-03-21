const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM users;');
    console.log('User count:', res.rows[0].count);
    const users = await pool.query('SELECT name, email, role FROM users LIMIT 10;');
    console.log('Users in DB:');
    console.table(users.rows);
  } catch (err) {
    console.error('Error checking users:', err.message);
  } finally {
    pool.end();
  }
}

checkUsers();
