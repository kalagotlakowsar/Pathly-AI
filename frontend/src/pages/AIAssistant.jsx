import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  'What should I learn next?',
  'Explain closures in JavaScript with an example',
  'What are my weak topics from past assessments?',
  'Recommend learning resources for Python',
  'Difference between SQL WHERE and HAVING',
  'What is Big-O asymptotic notation?'
];

export default function AIAssistant() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: "Hello! I am your **Pathly Learning Assistant**. I can explain programming concepts, review your assessment mistakes, suggest your next roadmap task, or point you to curated documentation. How can I help you learn today?",
      is_ai_generated: false,
      provider_note: "Pathly Rule Engine"
    }
  ]);
  const [inputMessage, setInputMessage] = useState(initialQuery);
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  useEffect(() => {
    // Load roadmaps for context selector
    api.getRoadmaps()
      .then(data => {
        setRoadmaps(data);
        if (data.length > 0) setSelectedRoadmapId(data[0].id);
      })
      .catch(() => {});

    // If query in URL, auto-send or set
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, []);

  const handleSend = async (messageText) => {
    const text = (messageText || inputMessage).trim();
    if (!text || sending) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      is_ai_generated: false,
      provider_note: 'User'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await api.sendChatMessage(
        text,
        'default',
        selectedRoadmapId ? parseInt(selectedRoadmapId, 10) : null
      );

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.reply,
        is_ai_generated: res.is_ai_generated,
        provider_note: res.provider_note
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your query: ' + err.message,
          is_ai_generated: false,
          provider_note: 'System Error'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
              AI Learning Assistant
            </h1>
            <span className="badge badge-lavender" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={12} /> Real-Time Tutor
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Transparent AI inference with deterministic fallback when API keys are unconfigured.
          </p>
        </div>

        {/* Roadmap Context Selector */}
        {roadmaps.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--text-muted)" />
            <select
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              style={{ width: 'auto', fontSize: '0.84rem', padding: '6px 12px' }}
            >
              <option value="">No Roadmap Context</option>
              {roadmaps.map(r => (
                <option key={r.id} value={r.id}>Context: {r.skill} ({r.completion_percentage}%)</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        padding: '12px 4px',
      }}>
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {!isUser && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--pastel-lavender)',
                  color: 'var(--pastel-lavender-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '16px',
                  backgroundColor: isUser ? 'var(--pastel-lavender-dark)' : 'var(--bg-surface)',
                  color: isUser ? '#FFFFFF' : 'var(--text-main)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.94rem',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>

                {/* Attribution Badge */}
                {!isUser && (
                  <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: msg.is_ai_generated ? 'var(--pastel-green)' : 'var(--pastel-subtle, var(--bg-subtle))',
                      color: msg.is_ai_generated ? 'var(--pastel-green-text)' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                    }}>
                      {msg.provider_note}
                    </span>
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--pastel-pink)',
                  color: 'var(--pastel-pink-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  U
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', alignSelf: 'flex-start' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-lavender)',
              color: 'var(--pastel-lavender-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              padding: '10px 16px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
            }}>
              Pathly is formulating an explanation...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div style={{
        paddingTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        marginBottom: '10px',
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', flexShrink: 0 }}>
          Suggestions:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            style={{
              padding: '4px 10px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              fontSize: '0.78rem',
              fontWeight: '500',
              color: 'var(--text-muted)',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <input
          type="text"
          placeholder="Ask a question about a concept, your roadmap, or quiz mistakes..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          style={{
            border: 'none',
            boxShadow: 'none',
            padding: '8px',
            backgroundColor: 'transparent',
            flex: 1,
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={sending || !inputMessage.trim()}
          className="btn-primary"
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            opacity: !inputMessage.trim() || sending ? 0.6 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
