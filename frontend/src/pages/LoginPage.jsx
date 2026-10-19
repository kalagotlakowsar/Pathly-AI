import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PathlyLogo from '../components/PathlyLogo';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Info } from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('learner@pathly.ai');
  const [password, setPassword] = useState('demopass123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleSetupNotice, setGoogleSetupNotice] = useState('');
  const [googleConfig, setGoogleConfig] = useState(null);
  const googleBtnContainerRef = useRef(null);

  // Fetch Google OAuth configuration
  useEffect(() => {
    let isMounted = true;
    api.getGoogleAuthConfig()
      .then((config) => {
        if (!isMounted) return;
        setGoogleConfig(config);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize and render Google Identity Services (GIS) button when configured
  useEffect(() => {
    if (!googleConfig?.configured || !googleConfig?.client_id) return;

    let isMounted = true;
    let timerId = null;

    const initGsi = () => {
      if (!isMounted) return;
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleConfig.client_id,
            callback: handleGoogleCredentialResponse,
          });
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        } catch (e) {
          console.warn('Google Identity Services render warning:', e);
        }
      } else {
        timerId = setTimeout(initGsi, 150);
      }
    };

    initGsi();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [googleConfig]);

  const handleGoogleCredentialResponse = async (response) => {
    setErrorMessage('');
    setGoogleSetupNotice('');

    if (!response || !response.credential) {
      setErrorMessage('No credential token was returned from Google.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.verifyGoogleToken(response.credential);
      if (res && res.authenticated) {
        authService.setSession(res.user, res.token);
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to verify Google account credentials with backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setGoogleSetupNotice('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Real backend authentication
      const res = await api.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (res && res.authenticated) {
        authService.setSession(res.user, res.token);
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to sign in. Please check your credentials or register a new account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setGoogleSetupNotice('');

    if (googleConfig && googleConfig.configured && googleConfig.client_id) {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            if (googleConfig.url) {
              window.location.href = googleConfig.url;
            }
          }
        });
        return;
      }
      if (googleConfig.url) {
        window.location.href = googleConfig.url;
        return;
      }
    }

    // Google credentials are not yet provisioned in environment
    setGoogleSetupNotice(
      'Google OAuth & Identity Services (GIS) credentials are not configured on this server.\n\n' +
      'To enable real Google Sign-In:\n' +
      '1. Open Google Cloud Console: APIs & Services > Credentials.\n' +
      '2. Create an OAuth 2.0 Client ID (Application type: Web application).\n' +
      '3. Under Authorized JavaScript origins, add: http://localhost:5173\n' +
      '4. Under Authorized redirect URIs, add: http://localhost:5173/auth/callback\n' +
      '5. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file and restart backend.\n\n' +
      'You can sign in using your email and password below.'
    );
  };

  const handleDemoFill = () => {
    setEmail('learner@pathly.ai');
    setPassword('demopass123');
    setErrorMessage('');
    setGoogleSetupNotice('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-lavender)',
          filter: 'blur(60px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: 'var(--pastel-pink)',
          filter: 'blur(60px)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          zIndex: 10,
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <PathlyLogo
            size="auth"
            animated={true}
            showWordmark={true}
            showTagline={false}
            interactive={true}
          />
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: '800',
              color: 'var(--text-main)',
              marginTop: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to continue your personalized learning path
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              fontSize: '0.86rem',
              marginBottom: '18px',
              lineHeight: '1.4',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth Setup Notice */}
        {googleSetupNotice && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--pastel-amber)',
              border: '1px solid #FDE68A',
              color: 'var(--pastel-amber-text)',
              fontSize: '0.84rem',
              marginBottom: '18px',
              lineHeight: '1.4',
            }}
          >
            <Info size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <strong>Google OAuth Setup Required:</strong>
              <div style={{ marginTop: '3px', whiteSpace: 'pre-line' }}>{googleSetupNotice}</div>
            </div>
          </div>
        )}

        {/* Google Identity Services Container or Continue with Google Button */}
        {googleConfig?.configured && googleConfig?.client_id ? (
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <div ref={googleBtnContainerRef} style={{ width: '100%', minHeight: '44px' }} />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="btn-outline"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '16px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            or with email
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px' }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ paddingLeft: '38px', width: '100%' }}
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                htmlFor="login-password"
                style={{ fontSize: '0.84rem', fontWeight: '700' }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '38px', paddingRight: '38px', width: '100%' }}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Demo Fill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--pastel-lavender-dark)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Link to Sign Up */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: 'var(--pastel-lavender-dark)',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
