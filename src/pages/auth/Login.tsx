import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // We rely on AuthContext to handle the session
      toast.success('Logged in successfully');

      // Fetch role to redirect properly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-8">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
          Student Management System
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="block w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2.5 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="block w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2.5 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};
