import fs from 'fs';
import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    const migrationSql = fs.readFileSync('./supabase/migrations/20260614000003_student_onboarding_refactor.sql', 'utf8');

    console.log('Applying student onboarding refactor migration...');
    await sql.unsafe(migrationSql);
    console.log('Migration successfully applied!');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
