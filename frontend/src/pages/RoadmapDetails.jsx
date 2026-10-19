import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

export default function RoadmapDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Adaptation modal state
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [adaptPreview, setAdaptPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applyingAdaptation, setApplyingAdaptation] = useState(false);
  const [adaptSuccessMsg, setAdaptSuccessMsg] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRoadmap(id);
      setRoadmap(data);
    } catch (err) {
      setError(err.message || 'Failed to load roadmap details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [id]);

  const togglePhase = (phaseId) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await api.updateTaskStatus(id, taskId, newStatus);
      // Update local state without full reload
      setRoadmap(prev => {
        if (!prev) return prev;
        const newPhases = prev.phases.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        }));

        const total = prev.total_tasks;
        const completed = newPhases.reduce(
          (acc, p) => acc + p.tasks.filter(t => t.status === 'completed').length,
          0
        );
        const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

        return {
          ...prev,
          completed_tasks: completed,
          completion_percentage: percentage,
          phases: newPhases
        };
      });
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleOpenAdaptModal = async () => {
    setIsAdaptModalOpen(true);
    setAdaptSuccessMsg('');
    try {
      setLoadingPreview(true);
      const preview = await api.previewAdaptation(id);
      setAdaptPreview(preview);
    } catch (err) {
      alert('Error analyzing roadmap adaptation: ' + err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApplyAdaptation = async () => {
    try {
      setApplyingAdaptation(true);
      const res = await api.applyAdaptation(id, {
        include_weak_topics: true,
        recalculate_schedule: true
      });
      setAdaptSuccessMsg(res.message);
      await loadRoadmap(); // Refresh roadmap with newly added revision tasks
      setTimeout(() => {
        setIsAdaptModalOpen(false);
      }, 1500);
    } catch (err) {
      alert('Error applying adaptation: ' + err.message);
    } finally {
      setApplyingAdaptation(false);
    }
  };

  const handleDeleteRoadmap = async () => {
    try {
      setDeleting(true);
      await api.deleteRoadmap(id);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete roadmap: ' + err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Loading roadmap curriculum...</p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertTriangle size={36} color="var(--pastel-pink-dark)" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Roadmap Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error || 'This roadmap may have been deleted.'}</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Roadmap Header Card */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-lavender">{roadmap.skill}</span>
              <span className="badge badge-pink">{roadmap.level} Level</span>
              <span className="badge badge-blue">{roadmap.daily_study_time} mins/day</span>
              <span className="badge badge-amber">{roadmap.duration_weeks} Weeks</span>
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {roadmap.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
              {roadmap.description || `Targeting ${roadmap.career_goal || 'Software Engineering'}.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleOpenAdaptModal}
              className="btn-secondary"
              style={{ fontSize: '0.88rem', padding: '9px 16px' }}
              title="Detect weak topics and adjust schedule"
            >
              <Sliders size={16} />
              <span>Adapt Schedule</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn-outline"
              style={{ color: 'var(--pastel-pink-dark)', borderColor: 'var(--pastel-pink)', padding: '9px 14px' }}
              title="Delete this roadmap"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-subtle)',
          marginTop: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Overall Roadmap Progress
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--pastel-lavender-dark)' }}>
              {roadmap.completion_percentage}%
            </span>
          </div>
          <ProgressBar value={roadmap.completion_percentage} height={10} color="var(--pastel-lavender-dark)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span>{roadmap.completed_tasks} completed</span>
            <span>{roadmap.total_tasks - roadmap.completed_tasks} remaining</span>
            <span>{roadmap.total_tasks} total tasks</span>
          </div>
        </div>
      </div>

      {/* Phases and Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {roadmap.phases.map((phase) => {
          const isCollapsed = collapsedPhases[phase.id];
          const phaseCompletedCount = phase.tasks.filter(t => t.status === 'completed').length;
          const phaseTotalCount = phase.tasks.length;
          const phasePercentage = phaseTotalCount > 0 ? Math.round((phaseCompletedCount / phaseTotalCount) * 100) : 0;

          return (
            <div key={phase.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Phase Header Accordion */}
              <div
                onClick={() => togglePhase(phase.id)}
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: phasePercentage === 100 ? 'var(--pastel-green)' : 'var(--pastel-lavender)',
                    color: phasePercentage === 100 ? 'var(--pastel-green-dark)' : 'var(--pastel-lavender-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                  }}>
                    {phase.phase_number}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {phase.title}
                      </h3>
                      {phase.weeks_range && (
                        <span className="badge badge-lavender" style={{ fontSize: '0.72rem' }}>
                          {phase.weeks_range}
                        </span>
                      )}
                    </div>
                    {phase.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {phase.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {phaseCompletedCount} / {phaseTotalCount} tasks
                  </span>
                  {isCollapsed ? <ChevronDown size={20} color="var(--text-light)" /> : <ChevronUp size={20} color="var(--text-light)" />}
                </div>
              </div>

              {/* Tasks List */}
              {!isCollapsed && (
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {phase.tasks.map((task) => {
                    const isDone = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: isDone ? 'var(--pastel-green)' : isInProgress ? 'var(--pastel-blue)' : 'var(--border-color)',
                          backgroundColor: isDone ? 'rgba(220, 252, 231, 0.25)' : isInProgress ? 'rgba(224, 242, 254, 0.25)' : 'var(--bg-surface)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                          {/* Completion Checkmark Button */}
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, isDone ? 'not_started' : 'completed')}
                            style={{
                              marginTop: '2px',
                              color: isDone ? 'var(--pastel-green-dark)' : 'var(--border-hover)',
                              transition: 'transform 0.15s ease',
                            }}
                            title={isDone ? "Mark as Not Started" : "Mark as Completed"}
                          >
                            <CheckCircle2 size={22} fill={isDone ? 'var(--pastel-green)' : 'transparent'} />
                          </button>

                          <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                                textDecoration: isDone ? 'line-through' : 'none',
                              }}>
                                {task.title}
                              </h4>

                              {task.is_milestone && (
                                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                                  <Award size={12} /> Milestone Project
                                </span>
                              )}

                              {task.is_revision && (
                                <span className="badge badge-pink" style={{ fontSize: '0.72rem' }}>
                                  <Sparkles size={12} /> Revision Module
                                </span>
                              )}
                            </div>

                            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '8px' }}>
                              {task.description}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Topic: <strong>{task.topic}</strong></span>
                              <span style={{ color: 'var(--text-light)' }}>•</span>
                              <span style={{ color: 'var(--text-muted)' }}>⏱️ {task.estimated_minutes} mins</span>
                              <span style={{ color: 'var(--text-light)' }}>•</span>
                              <span style={{ color: 'var(--text-muted)' }}>Day {task.due_day}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Status Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: '600',
                              padding: '6px 12px',
                              width: 'auto',
                              borderRadius: '20px',
                              backgroundColor: isDone ? 'var(--pastel-green)' : isInProgress ? 'var(--pastel-blue)' : 'var(--bg-subtle)',
                              color: isDone ? 'var(--pastel-green-text)' : isInProgress ? 'var(--pastel-blue-text)' : 'var(--text-muted)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Adaptive Roadmap Modal */}
      <Modal
        isOpen={isAdaptModalOpen}
        onClose={() => setIsAdaptModalOpen(false)}
        title="Adaptive Roadmap Adjustment"
        maxWidth="600px"
      >
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.5' }}>
            Pathly's adaptive engine examines your actual assessment scores, detects identified weak areas, and recalibrates your upcoming tasks without erasing your completed progress.
          </p>

          {loadingPreview ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              Analyzing study performance and weak topics...
            </p>
          ) : adaptPreview ? (
            <div>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--pastel-lavender)',
                color: 'var(--pastel-lavender-text)',
                marginBottom: '20px',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                <strong>Diagnostic Explanation:</strong><br />
                {adaptPreview.explanation}
              </div>

              {adaptPreview.weak_topics_detected && adaptPreview.weak_topics_detected.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px' }}>
                    Weak Topics Detected ({adaptPreview.weak_topics_detected.length}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {adaptPreview.weak_topics_detected.map(w => (
                      <span key={w} className="badge badge-pink">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px' }}>
                  Proposed Adjustments:
                </p>
                <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {adaptPreview.changes.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {adaptSuccessMsg && (
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--pastel-green)',
                  color: 'var(--pastel-green-text)',
                  marginBottom: '16px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {adaptSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdaptModalOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyAdaptation}
                  disabled={applyingAdaptation}
                  className="btn-primary"
                >
                  {applyingAdaptation ? 'Applying Changes...' : 'Confirm & Apply Adaptation'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      {/* Delete Roadmap Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Roadmap"
        maxWidth="450px"
      >
        <div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <ShieldAlert size={28} color="var(--pastel-pink-dark)" />
            <div>
              <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                Are you sure you want to delete this roadmap?
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                This will remove "{roadmap.title}" and its {roadmap.total_tasks} associated tasks from your database.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRoadmap}
              disabled={deleting}
              className="btn-primary"
              style={{ backgroundColor: 'var(--pastel-pink-dark)' }}
            >
              {deleting ? 'Deleting...' : 'Delete Roadmap'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
