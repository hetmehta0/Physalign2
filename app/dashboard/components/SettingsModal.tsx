'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/dashboard/supabase';
import { useRouter } from 'next/navigation';


interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, clinic_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setDisplayName(profile.display_name || '');
          setClinicName(profile.clinic_name || '');
        }
      }
    }
    fetchUser();
  }, []);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update email
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) throw emailError;
      
      // Update profile
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: displayName || null,
            clinic_name: clinicName || null,
            updated_at: new Date().toISOString(),
          });
        
        if (profileError) throw profileError;
      }
      
      setSuccess('Profile updated successfully! Email confirmation sent to your new address.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          <button
            onClick={onClose}
            className="settings-modal-close"
            aria-label="Close settings"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <div className="settings-modal-tabs">
          <button
            onClick={() => setActiveTab('account')}
            className={`settings-tab ${activeTab === 'account' ? 'settings-tab-active' : ''}`}
          >
            <User className="icon-sm" />
            Account
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`settings-tab ${activeTab === 'password' ? 'settings-tab-active' : ''}`}
          >
            <Lock className="icon-sm" />
            Password
          </button>
        </div>

        <div className="settings-modal-content">
          {activeTab === 'account' && (
            <form onSubmit={handleUpdateEmail} className="settings-form">
              <div className="form-group">
                <label className="form-label">
                  <User className="icon-sm" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="form-input"
                  placeholder="Your name (e.g., Dr. Sarah Johnson)"
                  disabled={loading}
                />
                <p className="settings-help-text">
                  This name will be shown on your dashboard
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="form-input"
                  placeholder="Your clinic or practice name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail className="icon-sm" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder={user?.email || 'Enter new email'}
                  required
                  disabled={loading}
                />
                <p className="settings-help-text">
                  A confirmation email will be sent to your new address
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="settings-success-message">{success}</div>}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Save Profile'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="settings-form">
              <div className="form-group">
                <label className="form-label">
                  <Lock className="icon-sm" />
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter new password (min 8 characters)"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="settings-success-message">{success}</div>}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        <div className="settings-modal-footer">
          <button
            onClick={handleSignOut}
            className="settings-signout-button"
          >
            <LogOut className="icon-sm" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
