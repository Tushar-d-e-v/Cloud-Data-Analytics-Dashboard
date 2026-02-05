import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.connect()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully');
    
    // Create users table if it doesn't exist
    return pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);
  })
  .then(() => {
    console.log('✅ Users table ready');
  })
  .catch((error) => {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  });

export default pool;