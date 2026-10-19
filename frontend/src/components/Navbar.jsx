import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Flame, Clock, Plus, Sun, Moon, Menu, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import PathlyLogo from './PathlyLogo';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const [streakData, setStreakData] = useState({ current_streak: 0, today_minutes: 0, daily_goal_minutes: 45 });
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check saved theme preference
    const savedTheme = localStorage.getItem('pathly-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }

    // Load streak data
    api.getStreak()
      .then(data => setStreakData(data))
      .catch(() => {});

    // Listen for real-time daily goal updates
    const handleProfileUpdate = (e) => {
      if (e.detail && e.detail.daily_goal_minutes) {
        setStreakData(prev => ({
          ...prev,
          daily_goal_minutes: e.detail.daily_goal_minutes
        }));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const toggleTheme = () => {
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

  return (
    <header style={{
      height: '68px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            backgroundColor: 'var(--bg-subtle)',
          }}
          title="Toggle Navigation"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Pathly AI Dashboard">
          <PathlyLogo size="nav" animated={false} showWordmark={true} showTagline={false} />
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Streak Pill */}
        <Link to="/streaks" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: 'var(--pastel-amber)',
          color: 'var(--pastel-amber-text)',
          fontSize: '0.85rem',
          fontWeight: '700',
          transition: 'transform 0.15s ease',
        }}>
          <Flame size={16} fill="var(--pastel-amber-dark)" color="var(--pastel-amber-dark)" />
          <span>{streakData.current_streak} {streakData.current_streak === 1 ? 'day' : 'days'}</span>
        </Link>

        {/* Daily Study Minutes Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: 'var(--pastel-blue)',
          color: 'var(--pastel-blue-text)',
          fontSize: '0.85rem',
          fontWeight: '600',
        }}>
          <Clock size={15} color="var(--pastel-blue-dark)" />
          <span>{streakData.today_minutes} / {streakData.daily_goal_minutes}m</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="var(--text-muted)" />}
        </button>

        {/* Create Roadmap CTA */}
        <button
          onClick={() => navigate('/create-roadmap')}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Roadmap</span>
        </button>
      </div>
    </header>
  );
}
