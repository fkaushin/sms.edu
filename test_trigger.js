import postgres from 'postgres';
import crypto from 'crypto';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    const mockId = crypto.randomUUID();
    const email = `test_trigger_${Date.now()}@test.com`;
    const BCRYPT_HASH = '$2a$10$7EqJtDQOCG56U.g.x00KXu.n.Csn.63X59r8.tE7w27.7Z1v6C4y.';

    console.log(`Inserting mock user into auth.users (ID: ${mockId}, Email: ${email})...`);
    await sql`
      insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      values (${mockId}, '00000000-0000-0000-0000-000000000000', ${email}, ${BCRYPT_HASH}, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"role":"STUDENT"}', now(), now());
    `;

    console.log('Insert succeeded! Cleaning up mock user...');
    await sql`delete from auth.users where id = ${mockId};`;
    await sql`delete from public.profiles where id = ${mockId};`;
    console.log('Cleanup completed successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Insert failed with PostgreSQL error:', err);
    process.exit(1);
  }
}

run();
