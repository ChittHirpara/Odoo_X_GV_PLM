const { Pool } = require('pg');
const dbHealth = require('../utils/dbHealth');

// ── State ─────────────────────────────────────────
let pgPool = null;
let pgHealthy = false;

// ── Init ──────────────────────────────────────────
async function initDatabases() {
  console.log('[DB] Initializing Supabase PostgreSQL...');

  if (!process.env.DATABASE_URL) {
    console.error('[DB] ✗ CRITICAL: No DATABASE_URL found in environment');
    process.exit(1);
  }

  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }, // Required for Supabase
    });

    // Test connection
    const res = await pgPool.query('SELECT NOW()');
    pgHealthy = true;
    console.log('[DB] ✓ Supabase PostgreSQL connected at:', res.rows[0].now);
  } catch (err) {
    pgHealthy = false;
    console.error('[DB] ✗ PostgreSQL connection failed:', err.message);
    throw err;
  }
}

/**
 * Main query helper used by all routes
 * Usage: await req.db('SELECT * FROM users WHERE id = $1', [id])
 */
async function query(text, params) {
  if (!pgPool) throw new Error('[DB] Pool not initialized');
  try {
    const res = await pgPool.query(text, params);
    return res;
  } catch (err) {
    // If query fails due to connection issues, flag as unhealthy
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message.includes('terminated')) {
      dbHealth.setHealthy(false);
    }
    throw err;
  }
}

function getDBStatus() {
  const healthy = dbHealth.getStatus();
  return {
    current: healthy ? 'postgres' : 'fallback',
    postgres: { healthy: healthy },
    message: healthy ? 'Connected to Supabase PostgreSQL' : 'System in READ-ONLY FALLBACK mode',
    timestamp: new Date()
  };
}

module.exports = {
  initDatabases,
  query,
  getDBStatus
};
