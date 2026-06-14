import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    console.log('Querying auth tables row counts...');
    const usersCount = await sql`SELECT count(*) FROM auth.users`;
    console.log('auth.users:', usersCount[0].count);

    const identitiesCount = await sql`SELECT count(*) FROM auth.identities`;
    console.log('auth.identities:', identitiesCount[0].count);

    const sessionsCount = await sql`SELECT count(*) FROM auth.sessions`;
    console.log('auth.sessions:', sessionsCount[0].count);

    const refreshTokensCount = await sql`SELECT count(*) FROM auth.refresh_tokens`;
    console.log('auth.refresh_tokens:', refreshTokensCount[0].count);

    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err);
    process.exit(1);
  }
}

run();
