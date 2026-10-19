import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  Zap,
  Footprints,
  Map,
  ClipboardCheck,
  Crown,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';

export default function GoalsStreaks() {
  const [streakData, setStreakData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [dailyGoalInput, setDailyGoalInput] = useState(45);
  const [logMinutes, setLogMinutes] = useState(30);
  const [logTasks, setLogTasks] = useState(1);
  const [savingGoal, setSavingGoal] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, aData] = await Promise.all([
        api.getStreak(),
        api.getAchievements(),
      ]);
      setStreakData(sData);
      setDailyGoalInput(sData.daily_goal_minutes);
      setAchievements(aData);
    } catch (err) {
      console.error('Error fetching streaks and achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    try {
      setSavingGoal(true);
      const parsed = parseInt(dailyGoalInput, 10);
      await api.updateDailyGoal(parsed);
      await loadData();
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { daily_goal_minutes: parsed } }));
      alert('Daily learning goal updated successfully!');
    } catch (err) {
      alert('Error updating goal: ' + err.message);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    try {
      setLoggingActivity(true);
      await api.logActivity({
        minutes_spent: parseInt(logMinutes, 10),
        tasks_completed: parseInt(logTasks, 10),
      });
      await loadData();
      alert('Study activity recorded successfully!');
    } catch (err) {
      alert('Error logging activity: ' + err.message);
    } finally {
      setLoggingActivity(false);
    }
  };

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'footprints': return <Footprints size={24} />;
      case 'map': return <Map size={24} />;
      case 'clipboard-check': return <ClipboardCheck size={24} />;
      case 'crown': return <Crown size={24} />;
      case 'flame': return <Flame size={24} />;
      case 'zap': return <Zap size={24} />;
      case 'trending-up': return <TrendingUp size={24} />;
      case 'award': return <Award size={24} />;
      case 'book-open': return <BookOpen size={24} />;
      default: return <Award size={24} />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading streaks and achievements...
      </div>
    );
  }

  const goalProgress = streakData?.daily_goal_minutes > 0
    ? Math.min(100, Math.round((streakData.today_minutes / streakData.daily_goal_minutes) * 100))
    : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '16px',
          backgroundColor: 'var(--pastel-amber)',
          color: 'var(--pastel-amber-text)',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          <Flame size={14} />
          <span>Consistency & Gamified Milestones</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Daily Goals, Streaks & Badges
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Track daily study time, build an unbreakable learning streak, and unlock achievement badges based on genuine progress.
        </p>
      </div>

      {/* Main Two-Column: Streak Banner & Daily Goal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '36px',
      }}>
        {/* Streak Highlight Card */}
        <div className="card" style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-amber)',
            color: 'var(--pastel-amber-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Flame size={44} fill="var(--pastel-amber-dark)" />
          </div>

          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>
            {streakData?.current_streak || 0}
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--pastel-amber-dark)', marginBottom: '8px' }}>
            Day Learning Streak
          </p>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
            Longest recorded streak: <strong>{streakData?.longest_streak || 0} days</strong>. Qualifying activities: complete at least 1 task or 15 mins of study.
          </p>

          <div style={{
            marginTop: '20px',
            padding: '8px 16px',
            borderRadius: '16px',
            backgroundColor: streakData?.goal_completed_today ? 'var(--pastel-green)' : 'var(--bg-subtle)',
            color: streakData?.goal_completed_today ? 'var(--pastel-green-text)' : 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: '700'
          }}>
            {streakData?.goal_completed_today ? '🎉 Daily Goal Completed Today!' : 'Daily Goal In Progress'}
          </div>
        </div>

        {/* Daily Goal & Log Session Card */}
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
              Today's Study Progress
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
              <span style={{ color: 'var(--text-muted)' }}>Minutes Studied Today:</span>
              <span style={{ color: 'var(--text-main)' }}>{streakData?.today_minutes || 0} / {streakData?.daily_goal_minutes || 45} mins</span>
            </div>
            <ProgressBar value={goalProgress} height={10} color="var(--pastel-amber-dark)" />

            {/* Set Daily Goal Form */}
            <form onSubmit={handleUpdateGoal} style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                  Set Daily Target:
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--pastel-lavender-dark)' }}>
                  {dailyGoalInput} mins/day
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={dailyGoalInput}
                  onChange={(e) => setDailyGoalInput(e.target.value)}
                  style={{ flex: 1, padding: 0 }}
                />
                <button type="submit" disabled={savingGoal} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  Save
                </button>
              </div>
            </form>
          </div>

          {/* Quick Log Extra Study Minutes */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Log Offline Study Session:
            </p>
            <form onSubmit={handleLogActivity} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                min="5"
                max="360"
                value={logMinutes}
                onChange={(e) => setLogMinutes(e.target.value)}
                placeholder="Minutes"
                style={{ width: '100px' }}
                title="Minutes spent"
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>mins</span>
              <button
                type="submit"
                disabled={loggingActivity}
                className="btn-outline"
                style={{ padding: '8px 14px', fontSize: '0.82rem', marginLeft: 'auto' }}
              >
                <Plus size={14} /> Log Time
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Achievements Showcase Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Achievement Badges
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Unlocked: {achievements.filter(a => a.is_unlocked).length} of {achievements.length} badges
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {achievements.map((ach) => (
            <div
              key={ach.badge_code}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                opacity: ach.is_unlocked ? 1 : 0.65,
                backgroundColor: ach.is_unlocked ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                border: ach.is_unlocked ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: ach.is_unlocked ? 'var(--pastel-amber)' : 'var(--bg-surface)',
                color: ach.is_unlocked ? 'var(--pastel-amber-dark)' : 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {ach.is_unlocked ? getBadgeIcon(ach.icon) : <Lock size={22} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {ach.title}
                  </h4>
                  {ach.is_unlocked && (
                    <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      Unlocked
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '6px' }}>
                  {ach.description}
                </p>

                {ach.is_unlocked && ach.unlocked_at && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--pastel-green-text)', fontWeight: '600' }}>
                    Unlocked on {ach.unlocked_at.split('T')[0]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
