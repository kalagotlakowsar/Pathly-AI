import React from 'react';

export default function ProgressBar({ value = 0, color = 'var(--pastel-lavender-dark)', height = 8, showLabel = false }) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--text-main)' }}>{clampedValue}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${clampedValue}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '999px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}
