import postgres from 'postgres';
import crypto from 'crypto';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    const ADMIN_ID = '00000000-0000-0000-0000-000000000000';
    const ADMIN_EMAIL = 'admin@university.edu';
    const now = new Date().toISOString();

    console.log('Checking current auth.identities...');
    const existing = await sql`SELECT id FROM auth.identities WHERE user_id = ${ADMIN_ID}`;
    console.log('Existing identities:', existing.length);

    if (existing.length === 0) {
      console.log('Inserting missing auth.identities row for admin...');
      const identityId = crypto.randomUUID();
      await sql`
        INSERT INTO auth.identities (
          id,
          provider_id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          ${identityId},
          ${ADMIN_EMAIL},
          ${ADMIN_ID},
          ${JSON.stringify({ sub: ADMIN_ID, email: ADMIN_EMAIL })},
          'email',
          ${now},
          ${now},
          ${now}
        );
      `;
      console.log('auth.identities row inserted!');
    } else {
      console.log('Identity already exists, skipping insert.');
    }

    // Also confirm email is confirmed and has the right provider
    console.log('Verifying auth.users configuration...');
    await sql`
      UPDATE auth.users SET
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = '',
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        updated_at = now()
      WHERE id = ${ADMIN_ID};
    `;
    console.log('auth.users updated successfully!');

    // Final verify
    const verify = await sql`SELECT id, email, email_confirmed_at FROM auth.users WHERE id = ${ADMIN_ID}`;
    const identitiesVerify = await sql`SELECT id, provider FROM auth.identities WHERE user_id = ${ADMIN_ID}`;
    console.log('Admin user:', verify[0]);
    console.log('Identity row:', identitiesVerify[0]);

    console.log('\n✅ Fix complete! Try logging in now.');
    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
}

run();
