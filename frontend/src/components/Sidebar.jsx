import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  BookOpen,
  Brain,
  Bot,
  BarChart2,
  Flame,
  Briefcase,
  Settings,
  Sparkles,
  LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/auth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create-roadmap', label: 'Create Roadmap', icon: MapPin },
  { path: '/assessment', label: 'Skill Assessment', icon: ClipboardCheck },
  { path: '/resources', label: 'Learning Resources', icon: BookOpen },
  { path: '/practice', label: 'Practice & Quiz', icon: Brain },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/analytics', label: 'Progress & Analytics', icon: BarChart2 },
  { path: '/streaks', label: 'Goals & Streaks', icon: Flame },
  { path: '/careers', label: 'Career Roadmaps', icon: Briefcase },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const avatarEmojis = {
  smile: '😊',
  sparkles: '✨',
  rocket: '🚀',
  code: '💻',
  brain: '🧠',
  star: '⭐'
};

export default function Sidebar({ isOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    const stored = authService.getStoredUser();
    return {
      name: stored?.name || 'Pathly Learner',
      target_career: stored?.target_career || 'Full-Stack Goal',
      avatar: stored?.avatar || 'smile'
    };
  });

  useEffect(() => {
    // Load initial profile from database
    api.getProfile()
      .then(p => {
        if (p) {
          setProfile({
            name: p.name || 'Pathly Learner',
            target_career: p.target_career || 'Full-Stack Goal',
            avatar: p.avatar || 'smile'
          });
        }
      })
      .catch(() => {});

    // Listen for real-time profile updates from SettingsPage
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setProfile({
          name: e.detail.name || 'Pathly Learner',
          target_career: e.detail.target_career || 'Full-Stack Goal',
          avatar: e.detail.avatar || 'smile'
        });
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const displayAvatar = avatarEmojis[profile.avatar] || (profile.name ? profile.name.charAt(0).toUpperCase() : 'P');

  return (
    <aside
      style={{
        width: isOpen ? '260px' : '0px',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
        backgroundColor: 'var(--bg-surface)',
        borderRight: isOpen ? '1px solid var(--border-color)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 68px)',
        position: 'sticky',
        top: '68px',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '20px 16px 8px 16px' }}>
        <p style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-light)',
          paddingLeft: '12px',
          marginBottom: '8px'
        }}>
          Navigation
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--pastel-lavender)' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Replay 3D Intro Button */}
        <Link
          to="/intro"
          onClick={onCloseMobile}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: 'var(--pastel-lavender-text)',
            backgroundColor: 'var(--pastel-lavender)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          title="Replay 45-Second 3D Cinematic Intro"
        >
          <Sparkles size={14} color="var(--pastel-lavender-dark)" />
          <span>Replay 3D Intro</span>
        </Link>

        {/* User Profile Card with Sign Out */}
        <div style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Link
            to="/settings"
            onClick={onCloseMobile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
              overflow: 'hidden',
              flex: 1,
            }}
            title="Open Settings & Profile"
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-pink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pastel-pink-text)',
              fontWeight: '700',
              fontSize: profile.avatar && avatarEmojis[profile.avatar] ? '1.05rem' : '0.85rem',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {profile.avatar && (profile.avatar.startsWith('http://') || profile.avatar.startsWith('https://')) ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                displayAvatar
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {profile.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {profile.target_career}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              authService.clearSession();
              navigate('/login');
            }}
            style={{
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              transition: 'color 0.15s ease'
            }}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
