import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function fixRLS() {
  try {
    console.log('Dropping all existing policies on profiles...');
    const policies = await sql`
      SELECT policyname FROM pg_policies
      WHERE tablename = 'profiles' AND schemaname = 'public'
    `;
    for (const p of policies) {
      await sql.unsafe(`DROP POLICY IF EXISTS "${p.policyname}" ON public.profiles`);
      console.log(`  Dropped: ${p.policyname}`);
    }

    console.log('\nCreating clean, working RLS policies...');

    // Allow users to read their own profile (needed for login redirect)
    await sql`
      CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id)
    `;
    console.log('✅ SELECT own profile policy');

    // Allow admins to view ALL profiles
    await sql`
      CREATE POLICY "Admins can view all profiles"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
      )
    `;
    console.log('✅ SELECT all profiles (admins only) policy');

    // Allow admins to INSERT/UPDATE/DELETE all profiles
    await sql`
      CREATE POLICY "Admins can manage all profiles"
      ON public.profiles FOR ALL
      TO authenticated
      USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
      )
      WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
      )
    `;
    console.log('✅ ALL (admin management) policy');

    // Allow users to update own profile
    await sql`
      CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)
    `;
    console.log('✅ UPDATE own profile policy');

    // Allow trigger (service_role) to insert profiles
    await sql`
      CREATE POLICY "Service role can insert profiles"
      ON public.profiles FOR INSERT
      TO service_role
      WITH CHECK (true)
    `;
    console.log('✅ INSERT for service_role policy');

    console.log('\n✅ RLS policies cleaned up and fixed!');
    console.log('Try logging in at sms-edu.vercel.app/login now.');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixRLS();
