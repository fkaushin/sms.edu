import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function fixAll() {
  try {
    // Find the newly created admin user
    console.log('=== All auth.users ===');
    const users = await sql`
      SELECT id, email, created_at, email_confirmed_at
      FROM auth.users
      ORDER BY created_at DESC
    `;
    console.log(JSON.stringify(users, null, 2));

    // Find the admin user
    const adminUser = users.find(u => u.email === 'admin@university.edu');
    if (!adminUser) {
      console.log('\n❌ No admin@university.edu user found. Create it in Supabase dashboard first!');
      process.exit(1);
    }

    const adminId = adminUser.id;
    console.log('\n✅ Found admin user, ID:', adminId);

    // Check profile
    console.log('\n=== Current profile ===');
    const profiles = await sql`SELECT * FROM public.profiles WHERE id = ${adminId}`;
    console.log(JSON.stringify(profiles, null, 2));

    // Upsert the profile with ADMIN role
    await sql`
      INSERT INTO public.profiles (id, email, role, created_at)
      VALUES (${adminId}, 'admin@university.edu', 'ADMIN', now())
      ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', email = 'admin@university.edu'
    `;
    console.log('✅ Profile upserted with ADMIN role');

    // Set raw_user_meta_data
    await sql`
      UPDATE auth.users
      SET raw_user_meta_data = '{"role":"ADMIN"}'::jsonb,
          updated_at = now()
      WHERE id = ${adminId}
    `;
    console.log('✅ raw_user_meta_data set to ADMIN');

    // Verify
    const profile = await sql`SELECT * FROM public.profiles WHERE id = ${adminId}`;
    console.log('\n✅ Final profile:', JSON.stringify(profile[0], null, 2));
    console.log('\n🎉 Done! Try logging in at sms-edu.vercel.app/login');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixAll();
