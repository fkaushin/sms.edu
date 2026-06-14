import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function diagnose() {
  try {
    console.log('\n=== AUTH.USERS ===');
    const users = await sql`
      SELECT 
        id,
        email,
        aud,
        role,
        encrypted_password IS NOT NULL as has_password,
        length(encrypted_password) as pwd_length,
        left(encrypted_password, 7) as pwd_prefix,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_sso_user,
        deleted_at
      FROM auth.users
    `;
    console.log(JSON.stringify(users, null, 2));

    console.log('\n=== AUTH.IDENTITIES ===');
    const identities = await sql`
      SELECT id, user_id, provider, provider_id, identity_data, last_sign_in_at
      FROM auth.identities
    `;
    console.log(JSON.stringify(identities, null, 2));

    console.log('\n=== PROFILES TABLE ===');
    const profiles = await sql`SELECT * FROM public.profiles LIMIT 5`;
    console.log(JSON.stringify(profiles, null, 2));

    console.log('\n=== public.profiles schema ===');
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position
    `;
    console.log(JSON.stringify(schema, null, 2));

    console.log('\n=== Check for trigger on auth.users ===');
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    `;
    console.log(JSON.stringify(triggers, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

diagnose();
