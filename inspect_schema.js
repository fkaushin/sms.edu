import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    console.log('Querying triggers...');
    const triggers = await sql`
      SELECT event_object_table, trigger_name, action_statement
      FROM information_schema.triggers;
    `;
    console.log('Triggers found:', triggers);

    console.log('Querying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('Tables:', tables.map(t => t.table_name));

    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err);
    process.exit(1);
  }
}

run();
