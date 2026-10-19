import React from 'react';
import { Link } from 'react-router-dom';
import PathlyLogo from '../components/PathlyLogo';
import { Sparkles, ArrowRight, Compass, Layers, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient Pastel Glow Gradients */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '680px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(224, 242, 254, 0.25) 45%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-60px',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(232, 229, 248, 0.3) 50%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Clean Public Top Bar */}
      <header style={{
        height: '76px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <Link to="/welcome" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <PathlyLogo size="nav" animated={false} showWordmark={true} showTagline={false} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'none', sm: 'inline' }}>
            Already a member?
          </span>
          <Link
            to="/login"
            className="btn-secondary"
            style={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Standalone Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 60px 24px',
        position: 'relative',
        zIndex: 10,
        maxWidth: '960px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Animated 3D Emblem */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <PathlyLogo size="auth" animated={true} showWordmark={false} showTagline={false} interactive={true} />
        </div>

        {/* Brand Tag Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '30px',
          backgroundColor: 'var(--pastel-lavender)',
          color: 'var(--pastel-lavender-text)',
          fontSize: '0.84rem',
          fontWeight: '700',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Sparkles size={15} />
          <span>Intelligent Learning Roadmaps</span>
        </div>

        {/* Short & Clear Heading */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
          fontWeight: '800',
          lineHeight: '1.14',
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          marginBottom: '20px',
          maxWidth: '820px',
        }}>
          Your learning journey <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--pastel-lavender-dark) 0%, var(--pastel-pink-dark) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            starts here.
          </span>
        </h1>

        {/* Concise Description */}
        <p style={{
          fontSize: '1.18rem',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          lineHeight: '1.6',
          marginBottom: '36px',
        }}>
          Personalized AI study roadmaps tailored to your career goals, current skill level, and schedule. Master technologies step-by-step with structured phases and verified resources.
        </p>

        {/* Two Clear Primary Actions: Sign In & Create Account */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '56px',
        }}>
          <Link
            to="/signup"
            className="btn-primary"
            style={{
              padding: '16px 36px',
              fontSize: '1.05rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              textDecoration: 'none',
            }}
          >
            <Sparkles size={18} />
            <span>Create Account</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/login"
            className="btn-secondary"
            style={{
              padding: '16px 36px',
              fontSize: '1.05rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              textDecoration: 'none',
            }}
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* 3 Core Value Pillars (Clean, public info without dashboard links) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          width: '100%',
          textAlign: 'left',
        }}>
          <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-lavender)',
              color: 'var(--pastel-lavender-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Compass size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Structured Milestones
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Multi-week study phases and milestone projects configured precisely for your target career role.
            </p>
          </div>

          <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-blue)',
              color: 'var(--pastel-blue-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Skill Level Diagnostics
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Identify gaps and start learning at the right level — whether Beginner, Intermediate, or Advanced.
            </p>
          </div>

          <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-green)',
              color: 'var(--pastel-green-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <BookOpen size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Verified Materials
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Curated official documentation, interactive tutorials, and practice exercises with tracking.
            </p>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Pathly AI — Your Personal Learning Journey
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/signup" style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
