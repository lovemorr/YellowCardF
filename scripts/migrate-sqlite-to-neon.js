/**
 * Migration script to move data from SQLite to Neon PostgreSQL
 * 
 * Prerequisites:
 * 1. Install better-sqlite3: npm install better-sqlite3
 * 2. Set DATABASE_URL environment variable
 * 3. Run schema.sql in your Neon dashboard first
 * 
 * Usage: node scripts/migrate-sqlite-to-neon.js
 */

import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import 'dotenv/config';

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Opening SQLite database...');
  const sqlite = new Database('yellow_card.db', { readonly: true });
  
  console.log('Connecting to Neon...');
  const sql = neon(dbUrl);

  try {
    // Get all policies from SQLite
    const policies = sqlite.prepare('SELECT * FROM yellow_card_policies').all();
    console.log(`Found ${policies.length} policies to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const p of policies) {
      try {
        await sql`
          INSERT INTO yellow_card_policies (
            yellow_card_number, pic_name, policy_number, issued_on, issued_timestamp,
            valid_from, valid_upto, customer_name, vehicle_make, vehicle_reg_number,
            countries_covered, vehicle_engine_number, vehicle_chassis_number,
            vehicle_color, no_of_seats, issuing_nb_contact, secretariat_contact
          ) VALUES (
            ${p.yellow_card_number}, ${p.pic_name}, ${p.policy_number}, ${p.issued_on}, 
            ${p.issued_timestamp}, ${p.valid_from}, ${p.valid_upto}, ${p.customer_name}, 
            ${p.vehicle_make}, ${p.vehicle_reg_number}, ${p.countries_covered}, 
            ${p.vehicle_engine_number}, ${p.vehicle_chassis_number}, ${p.vehicle_color}, 
            ${p.no_of_seats}, ${p.issuing_nb_contact}, ${p.secretariat_contact}
          )
          ON CONFLICT (yellow_card_number) DO NOTHING
        `;
        migrated++;
        if (migrated % 10 === 0) console.log(`Migrated ${migrated}/${policies.length}...`);
      } catch (err) {
        console.error(`Failed to migrate ${p.yellow_card_number}:`, err.message);
        skipped++;
      }
    }

    console.log(`\n✓ Migration complete!`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped: ${skipped}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    sqlite.close();
  }
}

migrate();
