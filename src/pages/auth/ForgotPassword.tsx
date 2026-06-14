import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/student/change-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Password reset email sent! Please check your inbox.');
      navigate('/login');
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-8">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          Reset Password
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="space-y-6" onSubmit={handleReset}>
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
          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
