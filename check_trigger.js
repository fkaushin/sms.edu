import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function check() {
  try {
    // Get the trigger function source
    console.log('=== handle_new_user() function ===');
    const fn = await sql`
      SELECT prosrc, proname
      FROM pg_proc
      WHERE proname = 'handle_new_user'
    `;
    console.log(fn[0]?.prosrc || 'Function not found!');

    // Check RLS on profiles
    console.log('\n=== RLS on public.profiles ===');
    const rls = await sql`
      SELECT relrowsecurity, relname FROM pg_class 
      WHERE relname = 'profiles' AND relnamespace = 'public'::regnamespace
    `;
    console.log('RLS enabled:', rls[0]?.relrowsecurity);

    // Check policies
    console.log('\n=== Policies on profiles ===');
    const policies = await sql`
      SELECT policyname, cmd, roles, qual, with_check
      FROM pg_policies
      WHERE tablename = 'profiles' AND schemaname = 'public'
    `;
    console.log(JSON.stringify(policies, null, 2));

    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
check();
