import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

const newUserId = process.argv[2];

if (!newUserId) {
  console.error('Usage: node set_admin_role.js <user-id>');
  console.error('Get the user ID from Supabase Dashboard → Authentication → Users');
  process.exit(1);
}

async function setAdminRole() {
  try {
    console.log('Setting ADMIN role for user:', newUserId);

    // Upsert profile row with ADMIN role
    await sql`
      INSERT INTO public.profiles (id, role, email, created_at)
      SELECT 
        id,
        'ADMIN',
        email,
        now()
      FROM auth.users WHERE id = ${newUserId}
      ON CONFLICT (id) DO UPDATE SET role = 'ADMIN'
    `;

    // Update raw_user_meta_data so the app knows the role
    await sql`
      UPDATE auth.users
      SET raw_user_meta_data = '{"role":"ADMIN"}'::jsonb,
          updated_at = now()
      WHERE id = ${newUserId}
    `;

    const profile = await sql`SELECT * FROM public.profiles WHERE id = ${newUserId}`;
    console.log('\n✅ Admin role set!');
    console.log('Profile:', JSON.stringify(profile[0], null, 2));
    console.log('\nYou can now log in at sms-edu.vercel.app/login');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setAdminRole();
