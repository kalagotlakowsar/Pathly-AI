import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  CheckCircle2,
  Filter,
  FileText,
  Video,
  Code,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';

const SKILLS = ['All', 'Python', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'Java', 'Machine Learning', 'Cybersecurity'];
const TYPES = ['All', 'Documentation', 'Tutorial', 'Video', 'Practice'];

export default function LearningResources() {
  const [resources, setResources] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('all'); // 'all', 'completed', 'pending'
  const [loading, setLoading] = useState(true);

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSkill !== 'All') params.skill = selectedSkill;
      if (selectedType !== 'All') params.resource_type = selectedType;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterCompleted === 'completed') params.is_completed = true;
      if (filterCompleted === 'pending') params.is_completed = false;

      const data = await api.getResources(params);
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [selectedSkill, selectedType, filterCompleted]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  const handleToggleResource = async (resourceId, currentStatus) => {
    try {
      const updated = await api.toggleResource(resourceId, !currentStatus);
      setResources(prev => prev.map(r => r.id === resourceId ? updated : r));
    } catch (err) {
      alert('Error updating resource: ' + err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Documentation': return <FileText size={15} />;
      case 'Video': return <Video size={15} />;
      case 'Practice': return <Code size={15} />;
      default: return <GraduationCap size={15} />;
    }
  };

  const completedCount = resources.filter(r => r.is_completed).length;

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
          backgroundColor: 'var(--pastel-blue)',
          color: 'var(--pastel-blue-text)',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          <BookOpen size={14} />
          <span>Curated Knowledge Catalog</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Learning Resources
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Explore authentic documentation, high-yield tutorials, and interactive coding practice platforms. Mark items as completed to track your research.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by topic, framework, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
            Search
          </button>
        </form>

        {/* Skill Filter Chips */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Filter by Skill:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SKILLS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSkill(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  border: '1px solid',
                  borderColor: selectedSkill === s ? 'var(--pastel-blue-dark)' : 'var(--border-color)',
                  backgroundColor: selectedSkill === s ? 'var(--pastel-blue)' : 'var(--bg-subtle)',
                  color: selectedSkill === s ? 'var(--pastel-blue-text)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Type and Status Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>Type:</span>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  backgroundColor: selectedType === t ? 'var(--pastel-lavender)' : 'transparent',
                  color: selectedType === t ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Completed: {completedCount} / {resources.length}
            </span>
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <option value="all">All Resources</option>
              <option value="completed">Completed Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <BookOpen size={36} color="var(--pastel-blue-dark)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
            No resources found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Try resetting your filters or search terms to see all available materials.
          </p>
          <button
            onClick={() => { setSelectedSkill('All'); setSelectedType('All'); setSearchTerm(''); setFilterCompleted('all'); }}
            className="btn-secondary"
            style={{ marginTop: '16px' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '20px',
        }}>
          {resources.map((res) => (
            <div
              key={res.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: res.is_completed ? '4px solid var(--pastel-green-dark)' : '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.74rem' }}>
                      {getTypeIcon(res.resource_type)}
                      <span>{res.resource_type}</span>
                    </span>
                    <span className="badge badge-lavender" style={{ fontSize: '0.74rem' }}>
                      {res.skill}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleResource(res.id, res.is_completed)}
                    style={{
                      color: res.is_completed ? 'var(--pastel-green-dark)' : 'var(--border-hover)',
                      transition: 'transform 0.15s ease',
                    }}
                    title={res.is_completed ? "Mark as Incomplete" : "Mark as Completed"}
                  >
                    <CheckCircle2 size={20} fill={res.is_completed ? 'var(--pastel-green)' : 'transparent'} />
                  </button>
                </div>

                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: res.is_completed ? 'var(--text-muted)' : 'var(--text-main)',
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>
                  {res.title}
                </h3>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '16px' }}>
                  {res.description}
                </p>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '16px' }}>
                  Topic: <strong>{res.topic}</strong>
                </p>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: res.is_completed ? 'var(--pastel-green-text)' : 'var(--text-light)' }}>
                  {res.is_completed ? 'Completed' : 'Not started'}
                </span>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    gap: '6px',
                  }}
                >
                  <span>Open Resource</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
