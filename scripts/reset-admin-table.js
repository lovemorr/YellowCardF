import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function reset() {
  console.log('Resetting admin_users table...');
  
  await sql`DROP TABLE IF EXISTS admin_users`;
  
  await sql`
    CREATE TABLE admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await sql`CREATE INDEX idx_admin_username ON admin_users(username)`;
  
  console.log('✓ admin_users table reset with username field');
}

reset();
