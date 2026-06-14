import fs from 'fs';
import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    const storageSql = fs.readFileSync('./supabase/migrations/20260614000002_storage_setup.sql', 'utf8');

    console.log('Creating Storage buckets and setting up policies...');
    await sql.unsafe(storageSql);
    console.log('Storage buckets and policies successfully configured!');

    process.exit(0);
  } catch (err) {
    console.error('Storage setup failed:', err);
    process.exit(1);
  }
}

run();
