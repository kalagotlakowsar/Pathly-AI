import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Layers,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const POPULAR_SKILLS = [
  'Python',
  'JavaScript',
  'Web Development',
  'DSA',
  'SQL',
  'Java',
  'Machine Learning',
  'Cybersecurity'
];

export default function CreateRoadmap() {
  const [skill, setSkill] = useState('Python');
  const [customSkill, setCustomSkill] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [careerGoal, setCareerGoal] = useState('Full-Stack Developer');
  const [dailyStudyTime, setDailyStudyTime] = useState(45);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSelectSkill = (selected) => {
    setSkill(selected);
    setCustomSkill('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSkill = customSkill.trim() || skill;

    if (!finalSkill) {
      setError('Please select or enter a target skill.');
      return;
    }

    if (dailyStudyTime < 15 || dailyStudyTime > 480) {
      setError('Daily study time must be between 15 and 480 minutes.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await api.createRoadmap({
        skill: finalSkill,
        level,
        career_goal: careerGoal.trim() || 'Software Engineer',
        daily_study_time: parseInt(dailyStudyTime, 10),
        duration_weeks: parseInt(durationWeeks, 10),
        preferences: preferences.trim() || null,
      });

      // Redirect directly to the generated roadmap details
      navigate(`/roadmaps/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <Sparkles size={14} />
          <span>Intelligent Curriculum Synthesis</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Create Your Learning Roadmap
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Specify your target technology, starting experience level, and daily availability. We will assemble a structured multi-phase study plan.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--pastel-pink)',
          color: 'var(--pastel-pink-text)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
        {/* Step 1: Target Skill */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            1. Target Skill or Technology <span style={{ color: 'var(--pastel-pink-dark)' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {POPULAR_SKILLS.map(s => (
              <button
                type="button"
                key={s}
                onClick={() => handleSelectSkill(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  border: '1px solid',
                  borderColor: skill === s && !customSkill ? 'var(--pastel-lavender-dark)' : 'var(--border-color)',
                  backgroundColor: skill === s && !customSkill ? 'var(--pastel-lavender)' : 'var(--bg-subtle)',
                  color: skill === s && !customSkill ? 'var(--pastel-lavender-text)' : 'var(--text-main)',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Or type a custom skill (e.g. Go, Rust, Flutter, DevOps, React Native)..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            style={{ marginTop: '4px' }}
          />
        </div>

        {/* Step 2: Experience Level */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            2. Current Experience Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { id: 'Beginner', title: 'Beginner', desc: 'Little to no experience with this topic' },
              { id: 'Intermediate', title: 'Intermediate', desc: 'Know fundamentals, want design patterns' },
              { id: 'Advanced', title: 'Advanced', desc: 'Looking for optimization & architecture' },
            ].map(l => (
              <div
                key={l.id}
                onClick={() => setLevel(l.id)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid',
                  borderColor: level === l.id ? 'var(--pastel-lavender-dark)' : 'var(--border-color)',
                  backgroundColor: level === l.id ? 'var(--pastel-lavender)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <p style={{ fontWeight: '700', fontSize: '0.95rem', color: level === l.id ? 'var(--pastel-lavender-text)' : 'var(--text-main)' }}>
                  {l.title}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {l.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Career Goal */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            3. Desired Career Goal
          </label>
          <input
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Full-Stack Developer, Data Analyst, Python Engineer"
            required
          />
        </div>

        {/* Step 4: Daily Study Time & Duration */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Daily Study Time
              </label>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--pastel-lavender-dark)' }}>
                {dailyStudyTime} minutes / day
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={dailyStudyTime}
              onChange={(e) => setDailyStudyTime(e.target.value)}
              style={{ padding: '0', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
              <span>15 min</span>
              <span>45 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              Target Duration
            </label>
            <select
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
            >
              <option value="4">4 Weeks (Intensive Bootcamp)</option>
              <option value="8">8 Weeks (Standard Balanced)</option>
              <option value="12">12 Weeks (Comprehensive)</option>
              <option value="16">16 Weeks (Deep Dive)</option>
            </select>
          </div>
        </div>

        {/* Step 5: Optional Preferences */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            Optional Preferences or Focus Areas
          </label>
          <textarea
            rows="3"
            placeholder="e.g., Focus heavily on hands-on portfolio projects; emphasize backend architecture; preparing for technical interviews..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
        >
          {loading ? (
            <span>Generating Personalized Roadmap...</span>
          ) : (
            <>
              <span>Generate Roadmap</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
