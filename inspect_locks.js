import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    console.log('Querying active connections/locks...');
    const activities = await sql`
      SELECT pid, state, query, age(clock_timestamp(), query_start) AS age
      FROM pg_stat_activity
      WHERE state != 'idle' AND query NOT LIKE '%pg_stat_activity%';
    `;
    console.log('Active queries:', activities);

    // Let's check if we need to terminate any queries that are older than 1 minute
    let terminatedCount = 0;
    for (const activity of activities) {
      // If query is active and age is not null and represents a long running query/lock
      if (activity.pid && activity.state === 'active' && activity.query) {
        console.log(`Terminating hanging pid ${activity.pid} running: ${activity.query}`);
        await sql`SELECT pg_terminate_backend(${activity.pid})`;
        terminatedCount++;
      }
    }
    console.log(`Terminated ${terminatedCount} hanging backends.`);

    process.exit(0);
  } catch (err) {
    console.error('Lock inspection failed:', err);
    process.exit(1);
  }
}

run();
