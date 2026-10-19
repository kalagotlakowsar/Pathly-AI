import { api } from './api';

const AUTH_KEY = 'pathly_auth';
const USER_KEY = 'pathly_user';
const TOKEN_KEY = 'pathly_token';
const SESSION_CACHE_TTL_MS = 60 * 1000; // 60 seconds

// In-memory verification cache to eliminate redundant network calls on routine navigation
let _sessionState = {
  isValid: false,
  verifiedAt: 0,
  user: null,
};
let _inFlightVerifyPromise = null;

/**
 * Pathly Authentication & Session Service
 * 
 * Enforces strict session verification against the backend database on initial
 * load while caching verification in-memory to keep page transitions instant.
 */
export const authService = {
  /**
   * Fast synchronous check for locally stored credentials.
   * Note: This must NOT be treated as proof of authentication on its own.
   */
  hasStoredCredentials() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  /**
   * Check whether the session has already been verified recently in-memory.
   */
  isSessionVerified() {
    return (
      this.hasStoredCredentials() &&
      _sessionState.isValid === true &&
      Date.now() - _sessionState.verifiedAt < SESSION_CACHE_TTL_MS
    );
  },

  /**
   * Strictly verify the current session with the backend API.
   * - If no local flag exists, returns false immediately.
   * - If in-memory session is already verified and not expired (and forceRefresh is false),
   *   returns true immediately without network roundtrip.
   * - If verification is already in-flight, reuses the existing in-flight Promise.
   * - If backend responds with a valid user session, returns true.
   * - If backend rejects (401, 404, or network failure), clears stale data and returns false.
   */
  async verifyCurrentSession({ forceRefresh = false } = {}) {
    if (localStorage.getItem(AUTH_KEY) !== 'true') {
      _sessionState = { isValid: false, verifiedAt: 0, user: null };
      return false;
    }

    if (!forceRefresh && this.isSessionVerified()) {
      return true;
    }

    if (_inFlightVerifyPromise) {
      return _inFlightVerifyPromise;
    }

    _inFlightVerifyPromise = (async () => {
      try {
        // Primary verification: Check backend /api/auth/verify endpoint
        let res;
        try {
          res = await api.verifyAuth();
        } catch (e) {
          // Fallback verification: Check /api/settings/profile
          res = await api.getProfile();
        }

        const user = res?.user || res;
        if (user && user.id && user.email) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          _sessionState = {
            isValid: true,
            verifiedAt: Date.now(),
            user,
          };
          return true;
        }

        // Invalid response payload -> invalidate session
        this.clearSession();
        return false;
      } catch (err) {
        // Backend rejected or unreachable -> invalidate stale credentials
        this.clearSession();
        return false;
      } finally {
        _inFlightVerifyPromise = null;
      }
    })();

    return _inFlightVerifyPromise;
  },

  /**
   * Establish an authenticated session (used by email/password and Google login)
   */
  setSession(userData = null, token = null) {
    localStorage.setItem(AUTH_KEY, 'true');
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
    _sessionState = {
      isValid: true,
      verifiedAt: Date.now(),
      user: userData,
    };
    api.invalidateCache();
    window.dispatchEvent(new Event('authChange'));
  },

  /**
   * Update the locally stored user profile and synchronize across session state
   */
  updateUser(userData) {
    if (!userData) return;
    const existing = this.getStoredUser() || {};
    const merged = { ...existing, ...userData };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    _sessionState.user = merged;
    api.invalidateCache('user_profile');
    api.invalidateCache('auth_verify');
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: merged }));
  },

  /**
   * Clear all auth session data on logout or session expiration
   */
  clearSession() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    _sessionState = {
      isValid: false,
      verifiedAt: 0,
      user: null,
    };
    _inFlightVerifyPromise = null;
    api.invalidateCache();
    window.dispatchEvent(new Event('authChange'));
  },

  /**
   * Retrieve cached user details if available
   */
  getStoredUser() {
    if (_sessionState.user) {
      return _sessionState.user;
    }
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
};
