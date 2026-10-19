import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  ArrowRight,
  Plus,
  Play,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, roadmapsData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getRoadmaps(),
      ]);

      setOverview(analyticsData);
      setRoadmaps(roadmapsData);

      // Find first active roadmap and its next task
      const inProg = roadmapsData.find(r => r.status === 'in_progress') || roadmapsData[0];
      if (inProg) {
        setActiveRoadmap(inProg);
        const task = await api.getNextTask(inProg.id);
        setNextTask(task);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteNextTask = async () => {
    if (!nextTask || !activeRoadmap) return;
    try {
      await api.updateTaskStatus(activeRoadmap.id, nextTask.id, 'completed');
      await loadData(); // Reload to refresh progress & next task
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Loading your personalized learning dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Welcome back, Learner! ✨
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Here is your real-time learning progress, current streak, and next recommended tasks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/assessment" className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.9rem' }}>
            <Sparkles size={16} />
            <span>Test Skills</span>
          </Link>
          <Link to="/create-roadmap" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.9rem' }}>
            <Plus size={16} />
            <span>New Roadmap</span>
          </Link>
        </div>
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

      {/* Overview Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Card 1: Active Roadmaps */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Active Roadmaps</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-lavender)',
              color: 'var(--pastel-lavender-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.total_roadmaps || 0}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {overview?.completed_roadmaps || 0} fully completed
          </span>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tasks Completed</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-green)',
              color: 'var(--pastel-green-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.completed_tasks || 0} <span style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>/ {overview?.total_tasks || 0}</span>
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {overview?.overall_progress_percentage || 0}% overall progress
          </span>
        </div>

        {/* Card 3: Current Streak */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Current Streak</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-amber)',
              color: 'var(--pastel-amber-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.current_streak || 0} <span style={{ fontSize: '1rem', fontWeight: '600' }}>days</span>
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Longest streak: {overview?.longest_streak || 0} days
          </span>
        </div>

        {/* Card 4: Hours Learned */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Study Hours</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-blue)',
              color: 'var(--pastel-blue-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.total_hours_learned || 0} <span style={{ fontSize: '1rem', fontWeight: '600' }}>hrs</span>
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {overview?.total_quizzes_taken || 0} quizzes taken (avg {overview?.average_quiz_score || 0}%)
          </span>
        </div>
      </div>

      {/* Main Dashboard Two-Column Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        marginBottom: '36px',
      }}>
        {/* Next Recommended Task Card */}
        <div className="card" style={{
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '4px solid var(--pastel-lavender-dark)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="badge badge-lavender">
                <Play size={12} fill="currentColor" /> Up Next to Study
              </span>
              {activeRoadmap && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {activeRoadmap.skill}
                </span>
              )}
            </div>

            {nextTask ? (
              <>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {nextTask.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                  {nextTask.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge badge-blue">Topic: {nextTask.topic}</span>
                  <span className="badge badge-amber">{nextTask.estimated_minutes} mins</span>
                  <span className="badge badge-pink">{nextTask.difficulty}</span>
                </div>
              </>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                  {activeRoadmap ? '🎉 All tasks completed in this roadmap!' : 'No active roadmap found.'}
                </p>
                <Link to="/create-roadmap" className="btn-primary" style={{ marginTop: '14px', display: 'inline-flex' }}>
                  Create Roadmap
                </Link>
              </div>
            )}
          </div>

          {nextTask && activeRoadmap && (
            <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={handleCompleteNextTask}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                <CheckCircle2 size={16} />
                <span>Mark Completed</span>
              </button>
              <Link
                to={`/roadmaps/${activeRoadmap.id}`}
                className="btn-secondary"
                style={{ padding: '10px 16px' }}
              >
                <span>View Roadmap</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>

        {/* Assistant Quick Prompt Card */}
        <div className="card" style={{
          backgroundColor: 'var(--pastel-subtle, var(--bg-surface))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--pastel-pink)',
                color: 'var(--pastel-pink-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>AI Learning Assistant</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Ask questions about your roadmap, diagnose quiz mistakes, or get code examples at your level.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => navigate('/assistant?q=What should I learn next?')}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>"What should I learn next?"</span>
                <ArrowRight size={14} color="var(--text-light)" />
              </button>
              <button
                onClick={() => navigate('/assistant?q=Explain closures in JavaScript with an example')}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>"Explain closures in JavaScript"</span>
                <ArrowRight size={14} color="var(--text-light)" />
              </button>
            </div>
          </div>

          <Link
            to="/assistant"
            className="btn-outline"
            style={{ marginTop: '16px', textAlign: 'center', display: 'block' }}
          >
            Open Full Assistant Chat
          </Link>
        </div>
      </div>

      {/* Active Roadmaps List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Your Learning Roadmaps
          </h2>
          <Link to="/create-roadmap" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--pastel-lavender-dark)' }}>
            + Create Another Roadmap
          </Link>
        </div>

        {roadmaps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Compass size={40} color="var(--pastel-lavender-dark)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
              No learning roadmaps yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Choose a skill (Python, JavaScript, DSA, SQL, Web Dev) and get a structured, step-by-step roadmap.
            </p>
            <Link to="/create-roadmap" className="btn-primary">
              Generate Your First Roadmap
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {roadmaps.map(rm => (
              <div key={rm.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-lavender" style={{ marginBottom: '6px' }}>
                      {rm.level}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {rm.title}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: rm.status === 'completed' ? 'var(--pastel-green)' : 'var(--pastel-blue)',
                    color: rm.status === 'completed' ? 'var(--pastel-green-text)' : 'var(--pastel-blue-text)',
                  }}>
                    {rm.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {rm.description || `Targeting ${rm.daily_study_time} mins/day for ${rm.career_goal || 'development'}.`}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{rm.completed_tasks} / {rm.total_tasks} tasks</span>
                    <span style={{ color: 'var(--text-main)' }}>{rm.completion_percentage}%</span>
                  </div>
                  <ProgressBar value={rm.completion_percentage} height={8} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <Link to={`/roadmaps/${rm.id}`} className="btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      <span>View Phases & Tasks</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
