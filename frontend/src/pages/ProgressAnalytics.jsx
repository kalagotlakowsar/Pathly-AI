import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Printer,
  Sparkles,
  AlertTriangle,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

export default function ProgressAnalytics() {
  const [overview, setOverview] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(data => setOverview(data))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenReport = async () => {
    setIsReportModalOpen(true);
    try {
      setLoadingReport(true);
      const data = await api.getCompletionReport();
      setReportData(data);
    } catch (err) {
      alert('Error generating report: ' + err.message);
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading comprehensive learning analytics...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
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
            <BarChart2 size={14} />
            <span>Learning Telemetry & Analytics</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Progress & Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
            Empirical data derived from actual completed roadmap tasks, study durations, and assessment scores.
          </p>
        </div>

        <button
          onClick={handleOpenReport}
          className="btn-primary"
          style={{ padding: '12px 22px' }}
        >
          <FileText size={18} />
          <span>Generate Completion Report</span>
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Total Roadmaps
          </span>
          <p style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.total_roadmaps || 0}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--pastel-green-text)', fontWeight: '600' }}>
            {overview?.completed_roadmaps || 0} Roadmaps 100% Completed
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Tasks Finished
          </span>
          <p style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.completed_tasks || 0}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            out of {overview?.total_tasks || 0} total roadmap tasks
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Overall Completion
          </span>
          <p style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--pastel-lavender-dark)' }}>
            {overview?.overall_progress_percentage || 0}%
          </p>
          <ProgressBar value={overview?.overall_progress_percentage || 0} height={6} />
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Avg Assessment Score
          </span>
          <p style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {overview?.average_quiz_score || 0}%
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            across {overview?.total_quizzes_taken || 0} diagnostic attempts
          </span>
        </div>
      </div>

      {/* Two-Column Section: Weak Topics & Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        marginBottom: '36px',
      }}>
        {/* Weak Topics Cloud */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertTriangle size={18} color="var(--pastel-amber-dark)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Identified Weak Topics</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
            Aggregated from questions missed during skill assessments. Use these to trigger targeted revisions.
          </p>

          {overview?.weak_topics_summary && overview.weak_topics_summary.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {overview.weak_topics_summary.map(wt => (
                <span
                  key={wt}
                  className="badge badge-pink"
                  style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                >
                  {wt}
                </span>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--pastel-green)',
              color: 'var(--pastel-green-text)',
              fontSize: '0.88rem',
              fontWeight: '600'
            }}>
              No weak areas detected! Take more quizzes or explore intermediate topics.
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Clock size={18} color="var(--pastel-blue-dark)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Recent Study Activity</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Total cumulative study time: <strong>{overview?.total_hours_learned || 0} hours</strong>.
          </p>

          {overview?.recent_activities && overview.recent_activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overview.recent_activities.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '0.86rem',
                  }}
                >
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{act.date}</span>
                  <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                    <span>⏱️ {act.minutes_spent}m</span>
                    <span>✅ {act.tasks_completed} tasks</span>
                    <span>📝 {act.quizzes_taken} quizzes</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No study activity logged yet today. Complete a roadmap task to start logging time!
            </p>
          )}
        </div>
      </div>

      {/* Completion Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Personal Learning Completion Report"
        maxWidth="750px"
      >
        {loadingReport || !reportData ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Compiling verified learning data...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Printable Report Sheet */}
            <div style={{
              padding: '28px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--pastel-lavender)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--pastel-lavender-text)' }}>
                    Pathly Learning Achievement Report
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Issued to: <strong>{reportData.learner_name}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-light)' }}>
                  {reportData.generated_at}
                </div>
              </div>

              {/* Summary Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Tasks Done</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{reportData.total_tasks_completed}</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Study Hours</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{reportData.total_hours_spent} hrs</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Roadmaps</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{reportData.roadmaps_summary?.length || 0}</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Quizzes</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{reportData.assessments_summary?.length || 0}</p>
                </div>
              </div>

              {/* Roadmaps Summary */}
              {reportData.roadmaps_summary && reportData.roadmaps_summary.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                    Roadmap Curriculums:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {reportData.roadmaps_summary.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', padding: '6px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                        <span><strong>{r.title}</strong> ({r.level})</span>
                        <span>{r.completed_tasks}/{r.total_tasks} tasks ({r.progress})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones Achieved */}
              {reportData.milestones_achieved && reportData.milestones_achieved.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                    Milestones & Projects Built:
                  </h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {reportData.milestones_achieved.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.76rem',
                color: 'var(--text-light)',
                lineHeight: '1.45',
                marginTop: '16px'
              }}>
                <strong>Disclaimer:</strong> {reportData.disclaimer}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="btn-primary"
              >
                <Printer size={16} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
