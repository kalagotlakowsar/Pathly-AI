import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import PathlyLogo from '../components/PathlyLogo';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setErrorMessage(searchParams.get('error_description') || errorParam || 'Google authentication was declined or cancelled.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('No authorization code was received from Google.');
      return;
    }

    // Exchange real OAuth code with backend
    api.handleGoogleCallback(code)
      .then((data) => {
        authService.setSession(data.user, data.token);
        navigate('/dashboard');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete Google authentication with backend.');
      });
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ marginBottom: '20px' }}>
          <PathlyLogo size="auth" animated={false} showWordmark={true} showTagline={false} />
        </div>

        {status === 'processing' ? (
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--pastel-lavender-dark)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px auto',
            }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Authenticating with Google...
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Verifying your OAuth session token and setting up your workspace.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <AlertCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              Authentication Failed
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              {errorMessage}
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '0.92rem' }}>
              <span>Return to Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
