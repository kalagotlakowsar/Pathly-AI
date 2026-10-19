import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';

const SKILLS_LIST = ['Python', 'JavaScript', 'Web Development', 'DSA', 'SQL', 'Java', 'Machine Learning', 'Cybersecurity'];

export default function SkillAssessment() {
  const [skill, setSkill] = useState('Python');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleStartQuiz = async () => {
    try {
      setLoadingQuestions(true);
      setError(null);
      const data = await api.getQuestions(skill, difficulty);
      if (!data || data.length === 0) {
        setError(`No questions available for ${skill} at ${difficulty} level yet.`);
        return;
      }
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setResult(null);
      setIsTakingQuiz(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch assessment questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    const currentQ = questions[currentIndex];
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    // Build answers list
    const answersList = questions.map(q => ({
      question_id: q.id,
      selected_option_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1
    }));

    try {
      setSubmitting(true);
      setError(null);
      const evalResult = await api.submitAssessment({
        skill,
        difficulty,
        answers: answersList
      });

      setResult(evalResult);
      setIsTakingQuiz(false);
    } catch (err) {
      setError(err.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRoadmapFromLevel = () => {
    if (!result) return;
    navigate(`/create-roadmap?skill=${encodeURIComponent(result.skill)}&level=${encodeURIComponent(result.recommended_level)}`);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
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
          <ClipboardCheck size={14} />
          <span>Objective Diagnostic Engine</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Smart Skill Assessment
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Evaluate your technical proficiency through diagnostic questions. Receive a concrete score, identify weak topics, and find your ideal starting roadmap level.
        </p>
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
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Screen 1: Quiz Configurator */}
      {!isTakingQuiz && !result && (
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
            Choose Skill & Difficulty
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
              Select Skill
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SKILLS_LIST.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSkill(s)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: skill === s ? 'var(--pastel-pink-dark)' : 'var(--border-color)',
                    backgroundColor: skill === s ? 'var(--pastel-pink)' : 'var(--bg-subtle)',
                    color: skill === s ? 'var(--pastel-pink-text)' : 'var(--text-main)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
              Select Starting Difficulty
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid',
                    borderColor: difficulty === d ? 'var(--pastel-pink-dark)' : 'var(--border-color)',
                    backgroundColor: difficulty === d ? 'var(--pastel-pink)' : 'var(--bg-surface)',
                    color: difficulty === d ? 'var(--pastel-pink-text)' : 'var(--text-main)',
                    fontWeight: '700',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={loadingQuestions}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', backgroundColor: 'var(--pastel-pink-dark)' }}
          >
            {loadingQuestions ? 'Fetching Assessment Questions...' : 'Start Assessment'}
          </button>
        </div>
      )}

      {/* Screen 2: Active Assessment Question */}
      {isTakingQuiz && questions.length > 0 && (
        <div className="card" style={{ padding: '32px' }}>
          {/* Quiz Top Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="badge badge-lavender">{skill}</span>
              <span className="badge badge-pink">{questions[currentIndex].topic}</span>
            </div>
          </div>

          <ProgressBar
            value={((currentIndex + 1) / questions.length) * 100}
            color="var(--pastel-pink-dark)"
            height={6}
          />

          {/* Question Text */}
          <div style={{ margin: '28px 0 24px 0' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>
              {questions[currentIndex].question}
            </h2>
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {questions[currentIndex].options.map((opt, oIdx) => {
              const currentQ = questions[currentIndex];
              const isSelected = selectedAnswers[currentQ.id] === oIdx;

              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid',
                    borderColor: isSelected ? 'var(--pastel-pink-dark)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'var(--pastel-pink)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--pastel-pink-text)' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontWeight: isSelected ? '700' : '500',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: isSelected ? 'var(--pastel-pink-dark)' : 'var(--border-hover)',
                    backgroundColor: isSelected ? 'var(--pastel-pink-dark)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Quiz Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-outline"
              style={{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="btn-primary"
                style={{ backgroundColor: 'var(--pastel-pink-dark)' }}
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="btn-primary"
                style={{ backgroundColor: 'var(--pastel-pink-dark)', padding: '12px 24px' }}
              >
                {submitting ? 'Calculating Score...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Screen 3: Results & Analysis View */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Card */}
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: result.percentage >= 70 ? 'var(--pastel-green)' : 'var(--pastel-pink)',
              color: result.percentage >= 70 ? 'var(--pastel-green-dark)' : 'var(--pastel-pink-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <Award size={32} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
              Assessment Complete!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Skill: <strong>{result.skill}</strong> ({result.difficulty})
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '6px',
              padding: '12px 28px',
              borderRadius: '24px',
              backgroundColor: 'var(--bg-subtle)',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {result.score}
              </span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-light)', fontWeight: '600' }}>
                / {result.total_questions} ({result.percentage}%)
              </span>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Recommended Starting Roadmap Level:
              </p>
              <span className="badge badge-lavender" style={{ fontSize: '1.1rem', padding: '6px 18px', marginTop: '6px' }}>
                {result.recommended_level}
              </span>
            </div>

            {/* Weak Topics */}
            {result.weak_topics && result.weak_topics.length > 0 ? (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--pastel-amber)',
                color: 'var(--pastel-amber-text)',
                textAlign: 'left',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={18} />
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Identified Weak Topics:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.weak_topics.map(t => (
                    <span key={t} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      fontWeight: '600'
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                  Tip: Pathly's Adaptive Roadmap feature can automatically insert targeted revision modules for these topics.
                </p>
              </div>
            ) : (
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--pastel-green)',
                color: 'var(--pastel-green-text)',
                marginBottom: '24px',
                fontWeight: '600',
              }}>
                🎉 Outstanding work! Zero weak areas detected on this assessment.
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCreateRoadmapFromLevel}
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                <span>Generate {result.recommended_level} Roadmap</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { setResult(null); setIsTakingQuiz(false); }}
                className="btn-outline"
                style={{ padding: '12px 20px' }}
              >
                <RotateCcw size={16} />
                <span>Take Another Assessment</span>
              </button>
            </div>
          </div>

          {/* In-depth Question-by-Question Review */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>
              Answer Review & Explanations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {result.breakdowns && result.breakdowns.map((b, idx) => (
                <div
                  key={b.question_id}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: b.is_correct ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {b.is_correct ? (
                        <CheckCircle2 size={18} color="var(--pastel-green-dark)" />
                      ) : (
                        <XCircle size={18} color="var(--pastel-pink-dark)" />
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                        Question {idx + 1}
                      </span>
                      <span className="badge badge-lavender" style={{ fontSize: '0.75rem' }}>
                        {b.topic}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: b.is_correct ? 'var(--pastel-green-text)' : 'var(--pastel-pink-text)',
                    }}>
                      {b.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                    {b.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {b.options.map((opt, oIdx) => {
                      const isSelected = b.selected_option_index === oIdx;
                      const isCorrectOption = b.correct_option_index === oIdx;

                      let borderColor = 'transparent';
                      let bgColor = 'var(--bg-surface)';
                      let textColor = 'var(--text-muted)';

                      if (isCorrectOption) {
                        borderColor = 'var(--pastel-green-dark)';
                        bgColor = 'var(--pastel-green)';
                        textColor = 'var(--pastel-green-text)';
                      } else if (isSelected && !b.is_correct) {
                        borderColor = 'var(--pastel-pink-dark)';
                        bgColor = 'var(--pastel-pink)';
                        textColor = 'var(--pastel-pink-text)';
                      }

                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            backgroundColor: bgColor,
                            color: textColor,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{opt}</span>
                          {isCorrectOption && <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>Correct Answer</span>}
                          {isSelected && !isCorrectOption && <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--pastel-lavender)',
                    color: 'var(--pastel-lavender-text)',
                    fontSize: '0.84rem',
                    lineHeight: '1.45',
                  }}>
                    <strong>Explanation:</strong> {b.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
