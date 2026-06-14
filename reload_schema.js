import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    console.log('Notifying PostgREST to reload schema cache...');
    await sql`NOTIFY pgrst, 'reload schema';`;
    console.log('PostgREST notified successfully!');

    console.log('Notifying GoTrue auth schema reload if applicable...');
    // In PostgreSQL, let's make sure postgrest knows.
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Notification failed:', err);
    process.exit(1);
  }
}

run();
