import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function fixRecursion() {
  try {
    // Step 1: Create a SECURITY DEFINER function to get role WITHOUT triggering RLS
    console.log('Creating get_my_role() security definer function...');
    await sql`
      CREATE OR REPLACE FUNCTION public.get_my_role()
      RETURNS text
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = public
      AS $$
        SELECT role::text FROM public.profiles WHERE id = auth.uid()
      $$;
    `;
    console.log('✅ get_my_role() function created');

    // Step 2: Drop ALL existing policies
    console.log('\nDropping all existing policies...');
    const policies = await sql`
      SELECT policyname FROM pg_policies
      WHERE tablename = 'profiles' AND schemaname = 'public'
    `;
    for (const p of policies) {
      await sql.unsafe(`DROP POLICY IF EXISTS "${p.policyname}" ON public.profiles`);
      console.log(`  Dropped: ${p.policyname}`);
    }

    // Step 3: Recreate clean policies using the function (no recursion)
    console.log('\nCreating clean RLS policies...');

    // Users see their own profile
    await sql`
      CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id)
    `;
    console.log('✅ SELECT own profile');

    // Admins see ALL profiles (uses function, not recursive subquery)
    await sql`
      CREATE POLICY "Admins can view all profiles"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (public.get_my_role() = 'ADMIN')
    `;
    console.log('✅ SELECT all profiles (admin)');

    // Admins can insert/update/delete all profiles
    await sql`
      CREATE POLICY "Admins can manage all profiles"
      ON public.profiles FOR ALL
      TO authenticated
      USING (public.get_my_role() = 'ADMIN')
      WITH CHECK (public.get_my_role() = 'ADMIN')
    `;
    console.log('✅ ALL manage (admin)');

    // Users can update own profile
    await sql`
      CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)
    `;
    console.log('✅ UPDATE own profile');

    // Trigger/service_role can insert
    await sql`
      CREATE POLICY "Service role insert profiles"
      ON public.profiles FOR INSERT
      TO service_role
      WITH CHECK (true)
    `;
    console.log('✅ INSERT for service_role');

    console.log('\n🎉 All fixed! No more infinite recursion.');
    console.log('Try logging in at sms-edu.vercel.app/login');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixRecursion();
