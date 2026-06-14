import postgres from 'postgres';

const sql = postgres('postgresql://postgres.pzplsngbdrwouqcovfuz:7T$SkP8_3r.wuyx@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function fix() {
  try {
    console.log('Fix 1: Set handle_new_user() to SECURITY DEFINER so it bypasses RLS...');
    await sql`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, role)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'::user_role)
        );
        RETURN NEW;
      END;
      $$;
    `;
    console.log('✅ handle_new_user() updated with SECURITY DEFINER');

    console.log('\nFix 2: Add INSERT policy so trigger can always insert profiles...');
    await sql`
      DROP POLICY IF EXISTS "Service role can insert profiles." ON public.profiles;
    `;
    await sql`
      CREATE POLICY "Service role can insert profiles."
      ON public.profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
    `;
    console.log('✅ INSERT policy added for service_role');

    // Also add a self-insert policy (needed for signup flow)
    await sql`
      DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
    `;
    await sql`
      CREATE POLICY "Users can insert own profile."
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
    `;
    console.log('✅ Self-insert policy added for authenticated users');

    console.log('\n✅ All fixes applied! Now try creating the user in Supabase Dashboard again.');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fix();
