import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  try {
    console.log('Deleting all students, logs, and auth records...');
    
    await sql`
      truncate table public.activities, public.marks, public.attendance, public.students, public.reports cascade;
    `;
    
    await sql`
      delete from public.profiles where role = 'STUDENT';
    `;
    
    await sql`
      delete from auth.users where id not in (select id from public.profiles where role = 'ADMIN');
    `;
    
    console.log('Successfully deleted all students and auth profiles! Only admin user remains.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to delete students:', err);
    process.exit(1);
  }
}

run();
