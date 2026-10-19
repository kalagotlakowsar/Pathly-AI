import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  Sparkles,
  Clock,
  Target,
  Mail,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/auth';

const avatarOptions = [
  { id: 'smile', label: 'Learner', emoji: '😊' },
  { id: 'sparkles', label: 'Curious', emoji: '✨' },
  { id: 'rocket', label: 'Builder', emoji: '🚀' },
  { id: 'code', label: 'Coder', emoji: '💻' },
  { id: 'brain', label: 'Scholar', emoji: '🧠' },
  { id: 'star', label: 'Achiever', emoji: '⭐' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    target_career: '',
    current_level: 'Beginner',
    daily_goal_minutes: 45,
    avatar: 'smile'
  });
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState(() => {
    const stored = authService.getStoredUser();
    return (stored?.avatar && (stored.avatar.startsWith('http://') || stored.avatar.startsWith('https://')))
      ? stored.avatar
      : '';
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [health, setHealth] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadProfileData = async () => {
    try {
      setLoadingProfile(true);
      setLoadError('');
      const p = await api.getProfile();
      if (p) {
        setProfile({
          name: p.name || '',
          email: p.email || '',
          target_career: p.target_career || '',
          current_level: p.current_level || 'Beginner',
          daily_goal_minutes: p.daily_goal_minutes ?? 45,
          avatar: p.avatar || 'smile'
        });
        if (p.avatar && (p.avatar.startsWith('http://') || p.avatar.startsWith('https://'))) {
          setGoogleAvatarUrl(p.avatar);
        }
        authService.updateUser(p);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setLoadError(err.message || 'Failed to load profile. Please verify your connection.');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Check dark mode
    const savedTheme = localStorage.getItem('pathly-theme');
    setIsDark(savedTheme === 'dark');

    // Load profile & health
    loadProfileData();

    api.checkHealth()
      .then(h => setHealth(h))
      .catch(err => console.error(err));
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('pathly-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('pathly-theme', 'light');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveMsg('');

    const cleanName = (profile.name || '').trim();
    const cleanEmail = (profile.email || '').trim();
    const cleanCareer = (profile.target_career || '').trim();
    const parsedGoal = parseInt(profile.daily_goal_minutes, 10);

    // Frontend validation
    if (!cleanName) {
      setErrorMsg('Full Name cannot be empty.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (isNaN(parsedGoal) || parsedGoal < 15 || parsedGoal > 480) {
      setErrorMsg('Daily study goal must be between 15 and 480 minutes (8 hours max).');
      return;
    }

    const payload = {
      name: cleanName,
      email: cleanEmail,
      target_career: cleanCareer,
      current_level: profile.current_level || 'Beginner',
      daily_goal_minutes: parsedGoal,
      avatar: profile.avatar || 'smile'
    };

    try {
      setSaving(true);
      const updated = await api.updateProfile(payload);
      
      // Update form state with the exact server response
      setProfile({
        name: updated.name,
        email: updated.email,
        target_career: updated.target_career || '',
        current_level: updated.current_level || 'Beginner',
        daily_goal_minutes: updated.daily_goal_minutes,
        avatar: updated.avatar || 'smile'
      });
      if (updated.avatar && (updated.avatar.startsWith('http://') || updated.avatar.startsWith('https://'))) {
        setGoogleAvatarUrl(updated.avatar);
      }

      // Synchronize across auth session and trigger events for layout components
      authService.updateUser(updated);

      setSaveMsg('Profile saved successfully! Your changes are persisted in the database.');

      // Dispatch global event so sidebar and navbar reflect the change immediately
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updated }));

      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || 'Failed to update profile. Please check the inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset demo data? This will clear roadmaps, attempts, and streaks while preserving the resource catalog.')) {
      return;
    }

    try {
      setResetting(true);
      await api.resetDatabase();
      alert('Demo data reset successfully.');
      window.location.reload();
    } catch (err) {
      alert('Error resetting data: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '16px',
          backgroundColor: 'var(--pastel-lavender)',
          color: 'var(--pastel-lavender-text)',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          <Settings size={14} />
          <span>System & Preferences</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Settings & Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Manage your personal learner identity, daily learning goals, visual theme, and inspect active MCP tools.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <User size={22} color="var(--pastel-lavender-dark)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Learner Profile
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '22px' }}>
            Your personal profile configures your custom learning schedule and identifies your activity across all roadmaps and completion certificates.
          </p>

          {loadingProfile ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              gap: '12px',
              color: 'var(--text-muted)'
            }}>
              <Loader2 size={32} className="animate-spin" color="var(--pastel-lavender-dark)" />
              <p style={{ fontSize: '0.92rem', fontWeight: '600' }}>Loading learner profile from database...</p>
            </div>
          ) : loadError ? (
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--pastel-pink)',
              color: 'var(--pastel-pink-text)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertCircle size={20} />
                <span style={{ fontWeight: '700' }}>Failed to load profile</span>
              </div>
              <p style={{ fontSize: '0.88rem', marginBottom: '12px' }}>{loadError}</p>
              <button
                type="button"
                onClick={loadProfileData}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} />
                <span>Retry Loading</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile}>
              {/* Avatar Selector */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px' }}>
                  Avatar & Learner Persona
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {googleAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, avatar: googleAvatarUrl }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: (profile.avatar === googleAvatarUrl) ? '2px solid var(--pastel-lavender-dark)' : '1px solid var(--border-color)',
                        backgroundColor: (profile.avatar === googleAvatarUrl) ? 'var(--pastel-lavender)' : 'var(--bg-surface)',
                        color: (profile.avatar === googleAvatarUrl) ? 'var(--pastel-lavender-text)' : 'var(--text-main)',
                        fontWeight: (profile.avatar === googleAvatarUrl) ? '700' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img
                        src={googleAvatarUrl}
                        alt="Google Account"
                        referrerPolicy="no-referrer"
                        style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.85rem' }}>Google Photo</span>
                    </button>
                  )}
                  {avatarOptions.map(opt => {
                    const isSelected = (profile.avatar || 'smile') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, avatar: opt.id }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--pastel-lavender-dark)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--pastel-lavender)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--pastel-lavender-text)' : 'var(--text-main)',
                          fontWeight: isSelected ? '700' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{opt.emoji}</span>
                        <span style={{ fontSize: '0.85rem' }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label htmlFor="profile-name" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                    Full Name <span style={{ color: 'var(--pastel-pink-dark)' }}>*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Alex Chen"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                    Email Address <span style={{ color: 'var(--pastel-pink-dark)' }}>*</span>
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. alex@example.com"
                    required
                  />
                </div>
              </div>

              {/* Career & Level */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label htmlFor="profile-career" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                    Target Career Goal
                  </label>
                  <input
                    id="profile-career"
                    type="text"
                    value={profile.target_career}
                    onChange={(e) => setProfile(prev => ({ ...prev, target_career: e.target.value }))}
                    placeholder="e.g. Full-Stack Developer, AI Engineer"
                  />
                </div>

                <div>
                  <label htmlFor="profile-level" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                    Current Experience Level
                  </label>
                  <select
                    id="profile-level"
                    value={profile.current_level}
                    onChange={(e) => setProfile(prev => ({ ...prev, current_level: e.target.value }))}
                  >
                    <option value="Beginner">Beginner — Starting fresh</option>
                    <option value="Intermediate">Intermediate — Some hands-on experience</option>
                    <option value="Advanced">Advanced — Polishing expert patterns</option>
                  </select>
                </div>
              </div>

              {/* Daily Study Goal */}
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="profile-daily-goal" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                  Daily Study Goal (Minutes / Day) <span style={{ color: 'var(--pastel-pink-dark)' }}>*</span>
                </label>
                <div style={{ maxWidth: '320px' }}>
                  <input
                    id="profile-daily-goal"
                    type="number"
                    min="15"
                    max="480"
                    step="5"
                    value={profile.daily_goal_minutes}
                    onChange={(e) => setProfile(prev => ({ ...prev, daily_goal_minutes: e.target.value }))}
                    placeholder="45"
                    required
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Sets your pace for roadmap schedules and streak progress (15 min minimum, 480 min maximum).
                </p>
              </div>

              {/* Validation / Error Alert */}
              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--pastel-pink)',
                  color: 'var(--pastel-pink-text)',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  marginBottom: '18px'
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Alert */}
              {saveMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--pastel-green)',
                  color: 'var(--pastel-green-text)',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  marginBottom: '18px'
                }}>
                  <CheckCircle2 size={18} />
                  <span>{saveMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '11px 24px', opacity: saving ? 0.75 : 1 }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={loadProfileData}
                  disabled={saving}
                  className="btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  Reset Form
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Appearance & Theme Card */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
            Appearance & Interface Theme
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
            Pathly features a soft pastel aesthetic with full high-contrast dark mode support.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDark ? <Moon size={22} color="var(--pastel-lavender-dark)" /> : <Sun size={22} color="#FBBF24" />}
              <div>
                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                  {isDark ? 'Pastel Dark Theme' : 'Pastel Light Theme (Default)'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isDark ? 'Soft dark indigo background with luminous pastel accents' : 'Gentle cream and lavender backgrounds with accessible dark text'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleTheme}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Switch to {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                Cinematic 3D Intro Experience
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Experience the 45-second full-screen 3D glass animation and brand journey.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.href = '/intro'}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Sparkles size={14} />
              <span>Play 3D Intro</span>
            </button>
          </div>
        </div>

        {/* Model Context Protocol (MCP) & AI Integration Card */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Cpu size={22} color="var(--pastel-lavender-dark)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Model Context Protocol (MCP) & AI System
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px', lineHeight: '1.5' }}>
            Pathly includes an official Python Model Context Protocol (MCP) server. External AI clients can discover and invoke tools to generate roadmaps and query resources.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Backend Database:</span>
              <span className="badge badge-green">SQLite (`pathly.db`) Persistent</span>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>AI Provider Status:</span>
              <span className={health?.ai_enabled ? "badge badge-green" : "badge badge-amber"}>
                {health?.ai_enabled ? "Gemini 2.5 Flash Active" : "Rule Engine Fallback (Zero API Cost)"}
              </span>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Run MCP Server Command:
              </span>
              <code style={{ fontSize: '0.82rem', color: 'var(--pastel-lavender-text)', backgroundColor: 'var(--pastel-lavender)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                python backend/mcp_server.py
              </code>
            </div>
          </div>
        </div>

        {/* Database Management Card */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
            Data Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Reset your local activity to start a completely fresh learning evaluation session.
          </p>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="btn-outline"
            style={{ color: 'var(--pastel-pink-dark)', borderColor: 'var(--pastel-pink)' }}
          >
            <RefreshCw size={15} />
            <span>{resetting ? 'Resetting Data...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
