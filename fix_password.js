import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function fixAdmin() {
  try {
    const ADMIN_ID = '00000000-0000-0000-0000-000000000000';
    const PASSWORD = 'Admin@123456';

    // Check current password hash
    const user = await sql`SELECT encrypted_password FROM auth.users WHERE id = ${ADMIN_ID}`;
    if (user.length === 0) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    const currentHash = user[0].encrypted_password;
    console.log('Current hash prefix:', currentHash.substring(0, 10));
    
    // Test if current password matches
    const matches = await bcrypt.compare(PASSWORD, currentHash);
    console.log('Password "Admin@123456" matches current hash:', matches);

    if (!matches) {
      console.log('\nGenerating fresh bcrypt hash...');
      const newHash = await bcrypt.hash(PASSWORD, 10);
      console.log('New hash prefix:', newHash.substring(0, 10));
      
      await sql`
        UPDATE auth.users 
        SET encrypted_password = ${newHash},
            updated_at = now()
        WHERE id = ${ADMIN_ID}
      `;
      console.log('Password hash updated!');
      
      // Verify
      const verify = await sql`SELECT encrypted_password FROM auth.users WHERE id = ${ADMIN_ID}`;
      const verifyMatch = await bcrypt.compare(PASSWORD, verify[0].encrypted_password);
      console.log('Verification - password matches new hash:', verifyMatch);
    } else {
      console.log('\nPassword hash is correct. The issue is something else.');
    }

    // Also check the GoTrue schema_migrations
    console.log('\n=== auth.schema_migrations ===');
    const migrations = await sql`SELECT * FROM auth.schema_migrations ORDER BY version DESC LIMIT 5`;
    console.log(JSON.stringify(migrations, null, 2));

    // Check for any missing columns in auth.users compared to what GoTrue expects
    console.log('\n=== auth.users columns ===');
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log(JSON.stringify(cols.map(c => c.column_name), null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixAdmin();
