import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pzplsngbdrwouqcovfuz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cGxzbmdiZHJ3b3VxY292ZnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTE1NTUsImV4cCI6MjA5Njk4NzU1NX0.ai3G682qbXhaWq9ELOLOnrMUHrd8qF8Chl1cEX9BCWA'
);

async function run() {
  try {
    console.log('Testing select on public.profiles...');
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Select failed:', error);
    } else {
      console.log('Select successful! Found rows:', data.length);
    }
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

run();
