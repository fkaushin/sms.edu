import React, { useState } from 'react';
import { Mail, Lock, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { supabase } from '../../lib/supabase';
import { storageService } from '../../services/storageService';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: avatarUrl } = useQuery({
    queryKey: ['avatarUrl', user?.id],
    queryFn: () => storageService.getProfileAvatarUrl(user!.id),
    enabled: !!user?.id,
  });

  const handleEmailChange = async () => {
    if (!newEmail) return toast.error('Enter a new email address.');
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success('Verification email sent. Please check your inbox.');
      setNewEmail('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPwd) return toast.error('Enter a new password.');
    if (newPwd !== confirmPwd) return toast.error('Passwords do not match.');
    if (newPwd.length < 8) return toast.error('Password must be at least 8 characters.');
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Profile Photo</h2>
        <AvatarUpload userId={user?.id || ''} currentUrl={avatarUrl} size="lg" />
      </div>

      {/* Email */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            Email Address
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Email</label>
            <input
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={handleEmailChange}
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Update Email
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            Change Password
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Min 8 characters"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};
