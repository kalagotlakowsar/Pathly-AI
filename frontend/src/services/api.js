const BASE_URL = (import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '/api');

// In-memory response cache and in-flight request deduplication map
const apiCache = new Map();
const inFlightRequests = new Map();

/**
 * Executes a GET request with in-flight deduplication and short-lived caching.
 * Prevents multiple simultaneous calls from slamming the backend when multiple components mount.
 */
function cachedFetch(key, fetcher, ttlMs = 15000) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return Promise.resolve(cached.data);
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = fetcher()
    .then((data) => {
      apiCache.set(key, { data, timestamp: Date.now() });
      inFlightRequests.delete(key);
      return data;
    })
    .catch((err) => {
      inFlightRequests.delete(key);
      throw err;
    });

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Invalidates cache entries matching a given key pattern.
 */
function invalidateCache(pattern = null) {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.message || JSON.stringify(err);
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

function getAuthHeaders() {
  const headers = {};
  try {
    const token = localStorage.getItem('pathly_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const rawUser = localStorage.getItem('pathly_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u && u.id) {
        headers['X-User-Id'] = String(u.id);
      }
    }
  } catch (e) {
    // ignore
  }
  return headers;
}

function getActiveUserId() {
  try {
    const rawUser = localStorage.getItem('pathly_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u && u.id) return u.id;
    }
  } catch (e) {}
  return 'default';
}

export const api = {
  invalidateCache,
  getAuthHeaders,

  // Health & Auth Verification
  checkHealth: () => fetch(`${BASE_URL}/health`).then(handleResponse),
  verifyAuth: () => {
    const uid = getActiveUserId();
    return cachedFetch(`auth_verify_${uid}`, () =>
      fetch(`${BASE_URL}/auth/verify`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
      10000
    );
  },
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache();
        return res;
      }),
  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache();
        return res;
      }),
  getGoogleAuthConfig: () =>
    fetch(`${BASE_URL}/auth/google/config`).then(handleResponse),
  verifyGoogleToken: (credential) =>
    fetch(`${BASE_URL}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache();
        return res;
      }),
  handleGoogleCallback: (code) =>
    fetch(`${BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache();
        return res;
      }),

  // Roadmaps
  getRoadmaps: () =>
    cachedFetch('roadmaps_list', () => fetch(`${BASE_URL}/roadmaps`).then(handleResponse), 15000),
  getRoadmap: (id) =>
    cachedFetch(`roadmap_${id}`, () => fetch(`${BASE_URL}/roadmaps/${id}`).then(handleResponse), 15000),
  createRoadmap: (data) =>
    fetch(`${BASE_URL}/roadmaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('roadmaps');
        invalidateCache('roadmap_');
        invalidateCache('analytics');
        return res;
      }),
  deleteRoadmap: (id) =>
    fetch(`${BASE_URL}/roadmaps/${id}`, { method: 'DELETE' })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('roadmaps');
        invalidateCache(`roadmap_${id}`);
        invalidateCache('analytics');
        return res;
      }),
  updateTaskStatus: (roadmapId, taskId, status) =>
    fetch(`${BASE_URL}/roadmaps/${roadmapId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('roadmaps');
        invalidateCache(`roadmap_${roadmapId}`);
        invalidateCache('analytics');
        invalidateCache('streak');
        return res;
      }),
  getNextTask: (roadmapId) =>
    fetch(`${BASE_URL}/roadmaps/${roadmapId}/next-task`).then(handleResponse),
  previewAdaptation: (roadmapId) =>
    fetch(`${BASE_URL}/roadmaps/${roadmapId}/adapt/preview`, {
      method: 'POST',
    }).then(handleResponse),
  applyAdaptation: (roadmapId, data) =>
    fetch(`${BASE_URL}/roadmaps/${roadmapId}/adapt/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('roadmaps');
        invalidateCache(`roadmap_${roadmapId}`);
        return res;
      }),

  // Assessments
  getQuestions: (skill, difficulty = 'Beginner') =>
    fetch(
      `${BASE_URL}/assessments/questions?skill=${encodeURIComponent(skill)}&difficulty=${encodeURIComponent(difficulty)}`
    ).then(handleResponse),
  submitAssessment: (data) =>
    fetch(`${BASE_URL}/assessments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('assessments');
        invalidateCache('analytics');
        return res;
      }),
  getAttempts: () => fetch(`${BASE_URL}/assessments/attempts`).then(handleResponse),
  getWeakTopics: (skill = '') =>
    fetch(`${BASE_URL}/assessments/weak-topics${skill ? `?skill=${encodeURIComponent(skill)}` : ''}`).then(handleResponse),

  // Resources
  getResources: (params = {}) => {
    const query = new URLSearchParams();
    if (params.skill) query.append('skill', params.skill);
    if (params.topic) query.append('topic', params.topic);
    if (params.resource_type) query.append('resource_type', params.resource_type);
    if (params.is_completed !== undefined) query.append('is_completed', params.is_completed);
    if (params.search) query.append('search', params.search);
    const key = `resources_${query.toString()}`;
    return cachedFetch(key, () => fetch(`${BASE_URL}/resources?${query.toString()}`).then(handleResponse), 20000);
  },
  toggleResource: (id, is_completed) =>
    fetch(`${BASE_URL}/resources/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed }),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('resources');
        invalidateCache('streak');
        return res;
      }),

  // Streaks, Goals & Achievements
  getStreak: () => {
    const uid = getActiveUserId();
    return cachedFetch(`user_streak_${uid}`, () =>
      fetch(`${BASE_URL}/streaks`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
      15000
    );
  },
  updateDailyGoal: (daily_goal_minutes) =>
    fetch(`${BASE_URL}/streaks/daily-goal`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ daily_goal_minutes }),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('user_streak');
        invalidateCache('user_profile');
        return res;
      }),
  logActivity: (data) =>
    fetch(`${BASE_URL}/streaks/log-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('user_streak');
        invalidateCache('analytics');
        return res;
      }),
  getAchievements: () => {
    const uid = getActiveUserId();
    return cachedFetch(`user_achievements_${uid}`, () =>
      fetch(`${BASE_URL}/streaks/achievements`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
      30000
    );
  },

  // Careers
  getCareers: () =>
    cachedFetch('careers_list', () => fetch(`${BASE_URL}/careers`).then(handleResponse), 60000),
  generateCareerRoadmap: (slug, level = 'Beginner') =>
    fetch(`${BASE_URL}/careers/${slug}/generate?level=${encodeURIComponent(level)}`, {
      method: 'POST',
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('roadmaps');
        invalidateCache('analytics');
        return res;
      }),

  // Assistant
  sendChatMessage: (message, session_id = 'default', roadmap_id = null) =>
    fetch(`${BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id, roadmap_id }),
    }).then(handleResponse),
  getChatHistory: (session_id = 'default') =>
    fetch(`${BASE_URL}/assistant/history?session_id=${encodeURIComponent(session_id)}`).then(handleResponse),

  // Analytics & Reports
  getAnalyticsOverview: () =>
    cachedFetch('analytics_overview', () => fetch(`${BASE_URL}/analytics/overview`).then(handleResponse), 15000),
  getCompletionReport: () =>
    fetch(`${BASE_URL}/analytics/report`).then(handleResponse),

  // Settings & Profile
  getProfile: () => {
    const uid = getActiveUserId();
    return cachedFetch(`user_profile_${uid}`, () =>
      fetch(`${BASE_URL}/settings/profile`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
      15000
    );
  },
  updateProfile: (data) =>
    fetch(`${BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })
      .then(handleResponse)
      .then((res) => {
        invalidateCache('user_profile');
        invalidateCache('auth_verify');
        invalidateCache('user_streak');
        return res;
      }),
  resetDatabase: () =>
    fetch(`${BASE_URL}/settings/reset`, { method: 'POST' })
      .then(handleResponse)
      .then((res) => {
        invalidateCache();
        return res;
      }),
};
