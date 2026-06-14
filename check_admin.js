import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    console.log('Checking Auth Users...');
    const users = await sql`SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'admin@university.edu'`;
    console.log('Auth Users found:', users);

    console.log('Checking Profiles...');
    const profiles = await sql`SELECT id, email, role FROM public.profiles WHERE email = 'admin@university.edu'`;
    console.log('Profiles found:', profiles);

    if (users.length === 0) {
      console.log('Creating Admin in auth.users and public.profiles...');
      const adminId = '00000000-0000-0000-0000-000000000000';
      const BCRYPT_HASH = '$2a$10$7EqJtDQOCG56U.g.x00KXu.n.Csn.63X59r8.tE7w27.7Z1v6C4y.';
      
      await sql`
        insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        values (${adminId}, '00000000-0000-0000-0000-000000000000', 'admin@university.edu', ${BCRYPT_HASH}, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"role":"ADMIN"}', now(), now())
        on conflict (id) do nothing;
      `;
      
      await sql`
        insert into public.profiles (id, email, role)
        values (${adminId}, 'admin@university.edu', 'ADMIN')
        on conflict (id) do update set role = 'ADMIN';
      `;
      
      console.log('Admin user successfully recreated!');
    } else if (profiles.length === 0) {
      console.log('Profile missing. Recreating admin profile...');
      await sql`
        insert into public.profiles (id, email, role)
        values (${users[0].id}, 'admin@university.edu', 'ADMIN')
        on conflict (id) do update set role = 'ADMIN';
      `;
      console.log('Admin profile successfully recreated!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

run();
