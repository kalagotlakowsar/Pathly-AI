import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PathlyLogo from '../components/PathlyLogo';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * SplashScreen — Premium 3D Animated Entry Screen
 * 
 * Flow:
 * - Plays 3D logo formation: glass book opens, helical learning path draws up,
 *   3 milestone orbs pop & float, top star sparkles.
 * - Wordmark "Pathly AI" and tagline "Your Learning Journey, Personalized" reveal.
 * - Minimal smooth loading indicator (no fake percentage).
 * - Automatically transitions to Login after ~2.6s with a smooth fade/scale transition.
 * - Keyboard (Escape/Space/Enter) or click instantly skips to Login.
 */
export default function SplashScreen({ onComplete }) {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleFinish = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/login');
      }
    }, 320);
  };

  useEffect(() => {
    // Auto-transition timer (2.6 seconds for complete, tasteful presentation)
    const timer = setTimeout(() => {
      handleFinish();
    }, 2600);

    // Keyboard listener to skip immediately
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        clearTimeout(timer);
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={handleFinish}
      className={isExiting ? 'page-transition-exit page-transition-exit-active' : 'page-transition-enter-active'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1), transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Ambient Pastel Lighting Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-lavender)',
          filter: 'blur(90px)',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-pink)',
          filter: 'blur(95px)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-blue)',
          filter: 'blur(80px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Main 3D Logo Emblem & Wordmark */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <PathlyLogo
          size="splash"
          animated={true}
          showWordmark={true}
          showTagline={true}
          interactive={true}
        />

        {/* Minimal Animated Loading Track */}
        <div className="pathly-loading-track">
          <div className="pathly-loading-bar" />
        </div>

        {/* Minimal Milestone Pulse Dots */}
        <div className="pathly-loading-dots">
          <div className="pathly-loading-dot" />
          <div className="pathly-loading-dot" />
          <div className="pathly-loading-dot" />
        </div>
      </div>

      {/* Subtle Skip CTA at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.82rem',
          color: 'var(--text-light)',
          fontWeight: '600',
          letterSpacing: '0.02em',
          transition: 'color 0.2s ease',
          padding: '6px 12px',
          borderRadius: '16px',
        }}
      >
        <span>Click or press any key to enter</span>
        <ArrowRight size={14} />
      </div>
    </div>
  );
}
