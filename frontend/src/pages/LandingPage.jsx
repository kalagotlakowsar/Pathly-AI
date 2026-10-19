import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Brain,
  Layers,
  Flame,
  Award,
  BookOpen,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import PathlyLogo from '../components/PathlyLogo';

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 0' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '48px',
      }}>
        {/* Pastel decorative glow circles */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-lavender)',
          filter: 'blur(50px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          right: '-50px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-pink)',
          filter: 'blur(50px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />

        {/* Hero 3D Emblem */}
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
          <PathlyLogo size="auth" animated={true} showWordmark={false} showTagline={false} interactive={true} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '24px',
          backgroundColor: 'var(--pastel-lavender)',
          color: 'var(--pastel-lavender-text)',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '20px',
        }}>
          <Sparkles size={16} />
          <span>MCP-Powered Intelligent Learning Roadmap Generator</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: '800',
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          maxWidth: '850px',
          margin: '0 auto 20px auto',
        }}>
          Your Personal Learning Journey, <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--pastel-lavender-dark), var(--pastel-pink-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tailored to Your Ambition.
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 28px auto',
          lineHeight: '1.6',
        }}>
          Diagnose your skill level, generate custom step-by-step roadmaps, access verified learning materials, practice with smart assessments, and adapt your study schedule dynamically.
        </p>

        {/* Welcome Auth Options: Sign In & Sign Up */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px',
          padding: '8px 18px',
          borderRadius: '30px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Account Options:
          </span>
          <Link
            to="/login"
            style={{
              fontSize: '0.86rem',
              fontWeight: '700',
              color: 'var(--text-main)',
              textDecoration: 'none',
              padding: '5px 14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            style={{
              fontSize: '0.86rem',
              fontWeight: '700',
              color: 'var(--pastel-lavender-text)',
              textDecoration: 'none',
              padding: '5px 14px',
              borderRadius: '16px',
              backgroundColor: 'var(--pastel-lavender)',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </Link>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
        }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Sign Up Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '14px 26px', fontSize: '1rem' }}>
            <span>Sign In</span>
          </Link>
          <Link to="/create-roadmap" className="btn-outline" style={{ padding: '14px 24px', fontSize: '1rem' }}>
            <span>Generate Roadmap</span>
          </Link>
          <Link to="/dashboard" className="btn-outline" style={{ padding: '14px 24px', fontSize: '1rem' }}>
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Popular Skills Bar */}
        <div style={{
          marginTop: '44px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-light)', marginRight: '6px' }}>
            Supported Pathways:
          </span>
          {['Python', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'Java', 'Machine Learning', 'Cybersecurity'].map(skill => (
            <span key={skill} className="badge badge-lavender" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ marginBottom: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '8px' }}>
            Everything You Need to Master Tech Skills
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Built with real database persistence, verified resources, and a real Model Context Protocol (MCP) server.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {/* Feature 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pastel-lavender)',
              color: 'var(--pastel-lavender-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Personalized Roadmaps</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Structured into multi-week phases, daily study intervals, and milestone projects tailored specifically to your chosen level and career target.
            </p>
            <Link to="/create-roadmap" style={{ color: 'var(--pastel-lavender-dark)', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Create a roadmap <ArrowRight size={15} />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pastel-pink)',
              color: 'var(--pastel-pink-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Brain size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Smart Skill Diagnostics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Take multi-choice assessments that calculate real scores, identify weak topics, and automatically recommend your optimal starting level.
            </p>
            <Link to="/assessment" style={{ color: 'var(--pastel-pink-dark)', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Start an assessment <ArrowRight size={15} />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pastel-blue)',
              color: 'var(--pastel-blue-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Curated Learning Resources</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Direct verified links to official documentation (MDN, Python.org), interactive tutorials, and practice challenges. Track completed resources.
            </p>
            <Link to="/resources" style={{ color: 'var(--pastel-blue-dark)', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Browse resources <ArrowRight size={15} />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pastel-green)',
              color: 'var(--pastel-green-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Adaptive Rescheduling</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Fell behind or struggling with a topic? The adaptive engine injects targeted reinforcement tasks and recalculates dates without losing completed tasks.
            </p>
            <Link to="/roadmaps/1" style={{ color: 'var(--pastel-green-dark)', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Explore adaptation <ArrowRight size={15} />
            </Link>
          </div>

          {/* Feature 5 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pastel-amber)',
              color: 'var(--pastel-amber-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Flame size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Daily Streaks & Badges</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Real streaks calculated strictly from logged study sessions and completed tasks. Earn achievement badges as you hit key milestones.
            </p>
            <Link to="/streaks" style={{ color: 'var(--pastel-amber-dark)', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              View streaks & badges <ArrowRight size={15} />
            </Link>
          </div>

          {/* Feature 6 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--pastel-lavender)',
              color: 'var(--pastel-lavender-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Model Context Protocol (MCP)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Includes an official Python MCP server (`mcp_server.py`) with 6 testable tools for generating roadmaps, querying resources, and updating progress.
            </p>
            <Link to="/settings" style={{ color: 'var(--pastel-lavender-dark)', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              MCP server status <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer Card */}
      <section style={{
        padding: '48px 32px',
        backgroundColor: 'var(--pastel-lavender)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        <div style={{ maxWidth: '580px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--pastel-lavender-text)', marginBottom: '8px' }}>
            Ready to Accelerate Your Learning?
          </h3>
          <p style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>
            Create your first custom roadmap in under 60 seconds and start checking off daily learning tasks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '14px 26px', fontSize: '0.98rem' }}>
            <span>Sign Up Free</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '14px 22px', fontSize: '0.98rem', backgroundColor: 'var(--bg-surface)' }}>
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
