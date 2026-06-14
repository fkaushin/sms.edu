import fs from 'fs';
import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    const seedSql = fs.readFileSync('./supabase/migrations/20260614000001_seed_data.sql', 'utf8');

    console.log('Applying realistic seed data...');
    await sql.unsafe(seedSql);
    console.log('Seed data applied successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();
