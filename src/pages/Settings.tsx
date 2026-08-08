import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Download, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Topbar } from '../components/layout/Topbar';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useSettings, useUpdateSettings, useUpdateProfile, useDeleteAccount, useExportData } from '../hooks/useSettings';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-gradient-to-r from-brand-blue to-brand-violet' : 'bg-white/10')}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: checked ? 22 : 2 }} />
    </button>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('account');
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const { data: settings, isLoading: settingsLoading } = useSettings(user?.id);
  const updateSettings = useUpdateSettings(user?.id);
  const updateProfile = useUpdateProfile(user?.id);
  const deleteAccount = useDeleteAccount();
  const exportData = useExportData(user?.id);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name);
    setBio(profile.bio);
    setLocation(profile.location);
    setWebsite(profile.website);
  }, [profile]);

  async function handleSaveProfile() {
    await updateProfile.mutateAsync({ full_name: fullName, bio, location, website });
    await refreshProfile();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function handleChangePassword() {
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPasswordSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSubmitting(false);
    if (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated.' });
      setNewPassword('');
    }
  }

  async function handleDeleteAccount() {
    await deleteAccount.mutateAsync();
    navigate('/');
  }

  return (
    <DashboardLayout>
      <Topbar title="Settings" subtitle="Manage your account preferences." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn('flex shrink-0 items-center gap-2.5 rounded-xl2 px-4 py-2.5 text-sm font-medium transition-colors', tab === t.id ? 'glass text-white' : 'text-slate-400 hover:text-slate-200')}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>

        <GlassCard hover={false} className="p-6 sm:p-8">
          {tab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-white">Account Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" value={fullName} onChange={setFullName} />
                <Field label="Email" value={user?.email ?? ''} disabled />
                <Field label="Username" value={profile?.username ?? ''} disabled />
                <Field label="Location" value={location} onChange={setLocation} />
                <Field label="Website" value={website} onChange={setWebsite} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl2 border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <GlowButton size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </GlowButton>
                {profileSaved && <span className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle2 size={14} /> Saved</span>}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-sm font-semibold text-white">Your Data</h4>
                <div className="mt-3 flex flex-wrap gap-3">
                  <GlowButton variant="outline" size="sm" icon={<Download size={14} />} onClick={() => exportData.mutate()} disabled={exportData.isPending}>
                    {exportData.isPending ? 'Exporting...' : 'Export My Data'}
                  </GlowButton>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-sm font-semibold text-red-400">Danger Zone</h4>
                <p className="mt-1 text-xs text-slate-500">Permanently deletes your account and everything associated with it. This cannot be undone.</p>
                {!confirmingDelete ? (
                  <GlowButton variant="outline" size="sm" icon={<Trash2 size={14} />} className="mt-3 border-red-500/30 text-red-400 hover:border-red-500/60" onClick={() => setConfirmingDelete(true)}>
                    Delete Account
                  </GlowButton>
                ) : (
                  <div className="mt-3 flex items-center gap-3 rounded-xl2 border border-red-500/30 bg-red-500/5 p-4">
                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                    <p className="flex-1 text-xs text-red-300">Are you sure? This is permanent.</p>
                    <button onClick={() => setConfirmingDelete(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                    <GlowButton size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={handleDeleteAccount} disabled={deleteAccount.isPending}>
                      {deleteAccount.isPending ? 'Deleting...' : 'Confirm Delete'}
                    </GlowButton>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <h3 className="mb-4 text-base font-semibold text-white">Notification Preferences</h3>
              {settingsLoading || !settings ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  {[
                    { key: 'email_daily_reminders' as const, label: 'Daily challenge reminders' },
                    { key: 'email_contest_announcements' as const, label: 'Contest announcements' },
                    { key: 'email_ai_feedback' as const, label: 'AI feedback on submissions' },
                    { key: 'email_weekly_summary' as const, label: 'Weekly progress summary' },
                    { key: 'email_product_updates' as const, label: 'Product updates' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between border-b border-white/5 py-3.5 last:border-0">
                      <span className="text-sm text-slate-300">{label}</span>
                      <Toggle checked={settings[key]} onChange={(next) => updateSettings.mutate({ [key]: next })} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-white">Security</h3>

              {passwordMessage && (
                <div role="alert" className={cn('flex items-start gap-2 rounded-xl2 px-4 py-3 text-sm', passwordMessage.type === 'success' ? 'border border-green-500/20 bg-green-500/10 text-green-300' : 'border border-red-500/20 bg-red-500/10 text-red-300')}>
                  {passwordMessage.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  {passwordMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="********" />
              </div>

              {settings && (
                <div className="flex items-center justify-between rounded-xl2 bg-white/5 p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Two-factor authentication</p>
                    <p className="mt-0.5 text-xs text-slate-400">Add an extra layer of security to your account.</p>
                  </div>
                  <Toggle checked={settings.two_factor_enabled} onChange={(next) => updateSettings.mutate({ two_factor_enabled: next })} />
                </div>
              )}

              <GlowButton size="sm" onClick={handleChangePassword} disabled={passwordSubmitting || !newPassword}>
                {passwordSubmitting ? 'Updating...' : 'Update Password'}
              </GlowButton>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl2 border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
