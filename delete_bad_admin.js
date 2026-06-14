import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function deleteAdmin() {
  try {
    const ADMIN_ID = '00000000-0000-0000-0000-000000000000';

    console.log('Deleting from auth.identities...');
    await sql`DELETE FROM auth.identities WHERE user_id = ${ADMIN_ID}`;

    console.log('Deleting from public.profiles...');
    await sql`DELETE FROM public.profiles WHERE id = ${ADMIN_ID}`;

    console.log('Deleting from auth.users...');
    await sql`DELETE FROM auth.users WHERE id = ${ADMIN_ID}`;

    console.log('\n✅ Old admin user fully deleted.');
    console.log('\nNow go to Supabase Dashboard → Authentication → Users → "Add user"');
    console.log('  Email: admin@university.edu');
    console.log('  Password: Admin@123456');
    console.log('  ✅ Check "Auto Confirm User"');
    console.log('\nThen run: node set_admin_role.js <the-new-user-id>');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

deleteAdmin();
