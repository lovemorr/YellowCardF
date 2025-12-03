import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import 'dotenv/config';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function createAdmin() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not found. Make sure .env file exists.');
    process.exit(1);
  }

  const sql = neon(dbUrl);

  console.log('\n=== Create Admin User ===\n');
  
  const username = await question('Username: ');
  const password = await question('Password: ');

  if (!username || !password) {
    console.error('Username and password are required');
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES (${username}, ${passwordHash})
    `;
    
    console.log(`\n✓ Admin user "${username}" created successfully!`);
  } catch (error) {
    if (error.message.includes('duplicate')) {
      console.error(`\nError: User "${username}" already exists`);
    } else {
      console.error('\nError creating admin:', error.message);
    }
  }

  rl.close();
}

createAdmin();
