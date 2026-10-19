import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export default function CareerRoadmaps() {
  const [careers, setCareers] = useState([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [generatingSlug, setGeneratingSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api.getCareers()
      .then(data => {
        setCareers(data.careers || []);
        setDisclaimer(data.disclaimer || '');
      })
      .catch(err => console.error('Error fetching careers:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateCareerRoadmap = async (slug) => {
    try {
      setGeneratingSlug(slug);
      const created = await api.generateCareerRoadmap(slug, 'Beginner');
      navigate(`/roadmaps/${created.id}`);
    } catch (err) {
      alert('Error generating career roadmap: ' + err.message);
    } finally {
      setGeneratingSlug(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading career pathways...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
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
          <Briefcase size={14} />
          <span>Industry Career Alignment</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Career-Based Learning Pathways
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Explore required competencies, structured prerequisite learning sequences, and convert any pathway into an interactive personal study roadmap.
        </p>
      </div>

      {/* Prominent Disclaimer Banner */}
      <div style={{
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <AlertCircle size={20} color="var(--pastel-amber-dark)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
          {disclaimer}
        </p>
      </div>

      {/* Career Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {careers.map((career) => (
          <div
            key={career.slug}
            className="card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {career.title}
                  </h2>
                  <span className="badge badge-lavender" style={{ fontSize: '0.78rem' }}>
                    {career.primary_skill} Core
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '680px', lineHeight: '1.5' }}>
                  {career.description}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block' }}>
                  Market Range
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--pastel-green-text)' }}>
                  {career.typical_salary}
                </span>
              </div>
            </div>

            {/* Required Skills Chips */}
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Required Technical Competencies:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {career.required_skills.map((req, i) => (
                  <span key={i} className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                    {req}
                  </span>
                ))}
              </div>
            </div>

            {/* Prerequisite Learning Sequence */}
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
                Recommended Learning Order:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {career.recommended_order.map((step, idx) => (
                  <div key={idx} style={{ fontSize: '0.86rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} color="var(--pastel-lavender-dark)" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Milestones & Action */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: '600', marginRight: '6px' }}>
                  Capstone Projects:
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {career.project_milestones.join(' • ')}
                </span>
              </div>

              <button
                onClick={() => handleGenerateCareerRoadmap(career.slug)}
                disabled={generatingSlug === career.slug}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              >
                {generatingSlug === career.slug ? (
                  <span>Generating Career Roadmap...</span>
                ) : (
                  <>
                    <span>Generate {career.title} Roadmap</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
