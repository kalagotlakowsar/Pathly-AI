import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Lazy-loaded Pages for Route-based Code Splitting
const CinematicIntro = lazy(() => import('./pages/CinematicIntro'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateRoadmap = lazy(() => import('./pages/CreateRoadmap'));
const SkillAssessment = lazy(() => import('./pages/SkillAssessment'));
const RoadmapDetails = lazy(() => import('./pages/RoadmapDetails'));
const LearningResources = lazy(() => import('./pages/LearningResources'));
const PracticeQuiz = lazy(() => import('./pages/PracticeQuiz'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const ProgressAnalytics = lazy(() => import('./pages/ProgressAnalytics'));
const GoalsStreaks = lazy(() => import('./pages/GoalsStreaks'));
const CareerRoadmaps = lazy(() => import('./pages/CareerRoadmaps'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

import { authService } from './services/auth';

function PageFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      width: '100%'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(139, 92, 246, 0.15)',
        borderTopColor: '#8b5cf6',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
      }} />
    </div>
  );
}

// Route Guard: Ensures direct dashboard and internal URLs remain strictly protected
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState(() => {
    if (authService.isSessionVerified()) return 'authenticated';
    return authService.hasStoredCredentials() ? 'checking' : 'unauthenticated';
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = () => {
      if (!authService.hasStoredCredentials()) {
        if (isMounted) setStatus('unauthenticated');
      }
    };
    window.addEventListener('authChange', handleAuthChange);

    if (!authService.hasStoredCredentials()) {
      setStatus('unauthenticated');
      return () => {
        isMounted = false;
        window.removeEventListener('authChange', handleAuthChange);
      };
    }

    if (authService.isSessionVerified()) {
      setStatus('authenticated');
      return () => {
        isMounted = false;
        window.removeEventListener('authChange', handleAuthChange);
      };
    }

    // Verify session against backend on cold load
    authService.verifyCurrentSession().then((isValid) => {
      if (isMounted) {
        setStatus(isValid ? 'authenticated' : 'unauthenticated');
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--pastel-lavender-dark)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if intro has been seen during this browser session
  const [introSeen, setIntroSeen] = useState(() => {
    return sessionStorage.getItem('pathly_intro_seen') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebarMobile = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleIntroComplete = (targetRoute) => {
    sessionStorage.setItem('pathly_intro_seen', 'true');
    setIntroSeen(true);
    navigate(targetRoute || '/welcome', { replace: true });
  };

  // Explicit /intro or /splash route always plays full 20s cinematic intro
  if (location.pathname === '/intro' || location.pathname === '/splash') {
    return (
      <Suspense fallback={<PageFallback />}>
        <CinematicIntro onComplete={handleIntroComplete} />
      </Suspense>
    );
  }

  // Initial app visit: display full-screen immersive 20s intro
  if (location.pathname === '/' && !introSeen) {
    return (
      <Suspense fallback={<PageFallback />}>
        <CinematicIntro onComplete={handleIntroComplete} />
      </Suspense>
    );
  }

  // PUBLIC LAYOUT: /welcome, /login, /signup, /auth/callback
  // Standalone public experience WITHOUT sidebar, navbar, streak, timer, or New Roadmap button
  const isPublicRoute =
    location.pathname === '/welcome' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/auth/callback' ||
    (location.pathname === '/' && introSeen && !authService.hasStoredCredentials());

  if (isPublicRoute) {
    return (
      <div className="public-layout">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  // If visiting / while authenticated and intro has already been seen, redirect to dashboard
  if (location.pathname === '/' && introSeen && authService.hasStoredCredentials()) {
    return <Navigate to="/dashboard" replace />;
  }

  // AUTHENTICATED DASHBOARD LAYOUT:
  // Strictly for authenticated routes, wrapped with ProtectedRoute
  return (
    <ProtectedRoute>
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} onCloseMobile={closeSidebarMobile} />
        
        <div className="main-content">
          <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="page-body">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Protected Application Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-roadmap" element={<CreateRoadmap />} />
                <Route path="/assessment" element={<SkillAssessment />} />
                <Route path="/roadmaps/:id" element={<RoadmapDetails />} />
                <Route path="/resources" element={<LearningResources />} />
                <Route path="/practice" element={<PracticeQuiz />} />
                <Route path="/assistant" element={<AIAssistant />} />
                <Route path="/analytics" element={<ProgressAnalytics />} />
                <Route path="/streaks" element={<GoalsStreaks />} />
                <Route path="/careers" element={<CareerRoadmaps />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
