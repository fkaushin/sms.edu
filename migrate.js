import fs from 'fs';
import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    const schemaSql = fs.readFileSync('./supabase/migrations/20260614000000_initial_schema.sql', 'utf8');
    const seedSql = fs.readFileSync('./supabase/migrations/20260614000001_seed_data.sql', 'utf8');

    console.log('Running initial schema...');
    await sql.unsafe(schemaSql);
    console.log('Schema applied successfully.');

    console.log('Running seed data...');
    await sql.unsafe(seedSql);
    console.log('Seed data applied successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
