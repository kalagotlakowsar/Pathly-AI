import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Award,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

const FLASHCARDS = [
  {
    topic: 'JavaScript',
    front: 'What is a Closure in JavaScript?',
    back: 'A closure is an inner function that retains access to its outer (lexical) scope variables, even after the parent function has finished executing.'
  },
  {
    topic: 'Python',
    front: 'What makes a Python Generator memory-efficient?',
    back: 'Generators yield items one by one lazily on demand using the `yield` keyword rather than generating and storing the entire sequence in memory at once.'
  },
  {
    topic: 'SQL',
    front: 'Difference between WHERE and HAVING in SQL?',
    back: 'WHERE filters individual table rows BEFORE aggregation occurs; HAVING filters summarized groups AFTER the GROUP BY operation has completed.'
  },
  {
    topic: 'DSA',
    front: 'What is the time complexity of Binary Search?',
    back: 'O(log n). At each step, binary search eliminates half of the remaining sorted search space.'
  },
  {
    topic: 'Web Development',
    front: 'What are the 4 layers of the CSS Box Model?',
    back: 'From innermost to outermost: Content -> Padding -> Border -> Margin.'
  },
  {
    topic: 'React',
    front: 'What problem does the useEffect cleanup function solve?',
    back: 'It cancels pending network requests, cleans up event listeners, and disposes timers before the component unmounts or re-runs the effect, preventing memory leaks.'
  }
];

export default function PracticeQuiz() {
  const [attempts, setAttempts] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAttempts()
      .then(data => setAttempts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleFlip = (idx) => {
    setFlippedCards(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

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
            backgroundColor: 'var(--pastel-pink)',
            color: 'var(--pastel-pink-text)',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            <Brain size={14} />
            <span>Active Recall & Practice Hub</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Practice & Quiz
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
            Reinforce core software engineering concepts with interactive flashcards and review your past assessment attempts.
          </p>
        </div>

        <Link to="/assessment" className="btn-primary" style={{ padding: '12px 22px' }}>
          <ClipboardCheck size={18} />
          <span>New Skill Assessment</span>
        </Link>
      </div>

      {/* Concept Flashcards Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>
          Interactive Concept Flashcards
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Click any card to flip and verify your understanding of high-yield concepts.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
        }}>
          {FLASHCARDS.map((card, idx) => {
            const isFlipped = flippedCards[idx];

            return (
              <div
                key={idx}
                onClick={() => toggleFlip(idx)}
                style={{
                  minHeight: '190px',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  backgroundColor: isFlipped ? 'var(--pastel-lavender)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isFlipped ? 'var(--pastel-lavender-dark)' : 'var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge badge-lavender" style={{ fontSize: '0.72rem' }}>
                      {card.topic}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCw size={12} /> {isFlipped ? 'Answer' : 'Question'}
                    </span>
                  </div>

                  <p style={{
                    fontSize: isFlipped ? '0.92rem' : '1.05rem',
                    fontWeight: isFlipped ? '500' : '700',
                    color: isFlipped ? 'var(--pastel-lavender-text)' : 'var(--text-main)',
                    lineHeight: '1.5',
                  }}>
                    {isFlipped ? card.back : card.front}
                  </p>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '16px' }}>
                  {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Assessment Attempts History */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>
          Past Assessment History
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Historical record of your skill diagnostic attempts and identified weak topics.
        </p>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading assessment history...</p>
        ) : attempts.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <ClipboardCheck size={36} color="var(--pastel-pink-dark)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>
              No assessment attempts recorded yet
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Take a 5-minute technical quiz to evaluate your knowledge and track your score over time.
            </p>
            <Link to="/assessment" className="btn-primary">
              Take Your First Assessment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attempts.map(att => (
              <div
                key={att.id}
                className="card"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {att.skill} Diagnostic
                    </h3>
                    <span className="badge badge-lavender" style={{ fontSize: '0.75rem' }}>
                      {att.difficulty}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                      {att.created_at ? att.created_at.split('T')[0] : 'Recent'}
                    </span>
                  </div>

                  {att.weak_topics && att.weak_topics.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Weak Areas:</span>
                      {att.weak_topics.map(t => (
                        <span key={t} className="badge badge-pink" style={{ fontSize: '0.72rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--pastel-green-text)', fontWeight: '600', marginTop: '4px' }}>
                      All topics answered correctly!
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {att.percentage}%
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Score: {att.score}/{att.total_questions}
                    </p>
                  </div>

                  <Link
                    to={`/create-roadmap?skill=${encodeURIComponent(att.skill)}&level=${encodeURIComponent(att.recommended_level)}`}
                    className="btn-outline"
                    style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                  >
                    <span>Build Roadmap</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
