import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../services/auth';

/**
 * Pathly AI — 20-Second Cinematic Intro
 * 
 * Recreates the reference-image-inspired design with rich, subtle sparkles:
 * - 0–4s: Background glow appears; open 3D glass book unfolds with realistic depth.
 * - 4–9s: Translucent glass learning path draws upward in a smooth flowing motion.
 * - 9–13s: Milestone orbs appear sequentially; tiny sparkles begin twinkling around the path & orbs.
 * - 13–16s: A soft luminous shimmer travels along the path from the book toward the star; pinnacle star illuminates.
 * - 16–18s: "Pathly AI" wordmark and tagline fade in elegantly.
 * - 18–20s: All elements settle into a polished, breathing final composition before transition.
 * 
 * Navigation:
 * - When finished or when "Skip Intro →" is clicked, navigates to the existing Welcome page (/welcome).
 * - Duplicate navigation prevention ensures reliable transition.
 * - Sets sessionStorage 'pathly_intro_seen' so navigating between Welcome, Login, Signup, and Dashboard never replays.
 * - Full cleanup on unmount and reduced-motion accessibility support.
 */

const TOTAL_DURATION = 20.0; // Exactly 20 seconds

// 17 Strategically Placed 4-Point Diamond Sparkles around the Path, Orbs & Star
const SPARKLES = [
  // Surrounding the Pinnacle Star (Top)
  { id: 's1', cx: 236, cy: 50, r: 4.0, color: '#FFFFFF', delay: 0.1, duration: 2.2 },
  { id: 's2', cx: 268, cy: 56, r: 4.5, color: '#BAE6FD', delay: 0.6, duration: 2.5 },
  { id: 's3', cx: 218, cy: 78, r: 3.5, color: '#DDD6FE', delay: 1.1, duration: 2.0 },
  { id: 's4', cx: 278, cy: 84, r: 4.2, color: '#FBCFE8', delay: 1.5, duration: 2.4 },
  { id: 's5', cx: 250, cy: 30, r: 5.0, color: '#FFFFFF', delay: 0.8, duration: 2.6 },
  
  // Upper Curve & Orb 3 Surroundings
  { id: 's6', cx: 215, cy: 122, r: 3.8, color: '#DDD6FE', delay: 0.4, duration: 2.3 },
  { id: 's7', cx: 276, cy: 136, r: 4.0, color: '#BAE6FD', delay: 1.2, duration: 2.7 },
  { id: 's8', cx: 238, cy: 152, r: 3.2, color: '#FFFFFF', delay: 1.8, duration: 2.1 },
  
  // Middle Curve & Orb 2 Surroundings
  { id: 's9', cx: 334, cy: 168, r: 4.2, color: '#BAE6FD', delay: 0.3, duration: 2.5 },
  { id: 's10', cx: 346, cy: 188, r: 3.6, color: '#DDD6FE', delay: 0.9, duration: 2.2 },
  { id: 's11', cx: 308, cy: 198, r: 4.0, color: '#FBCFE8', delay: 1.6, duration: 2.8 },
  
  // Lower Curve & Orb 1 Surroundings
  { id: 's12', cx: 172, cy: 218, r: 4.0, color: '#DDD6FE', delay: 0.5, duration: 2.4 },
  { id: 's13', cx: 160, cy: 248, r: 3.8, color: '#BAE6FD', delay: 1.3, duration: 2.3 },
  { id: 's14', cx: 212, cy: 272, r: 4.2, color: '#FFFFFF', delay: 0.7, duration: 2.6 },
  { id: 's15', cx: 186, cy: 295, r: 3.5, color: '#FBCFE8', delay: 1.4, duration: 2.1 },
  
  // Rising from Book Crease
  { id: 's16', cx: 230, cy: 318, r: 3.6, color: '#BAE6FD', delay: 0.2, duration: 2.4 },
  { id: 's17', cx: 270, cy: 315, r: 4.0, color: '#DDD6FE', delay: 1.0, duration: 2.5 },
];

// 10 Floating Stardust Motes that gently drift upward and fade
const FLOATING_MOTES = [
  { id: 'm1', cx: 210, cy: 260, r: 2.2, color: '#BAE6FD', delay: 0.2, duration: 4.2 },
  { id: 'm2', cx: 285, cy: 240, r: 1.8, color: '#DDD6FE', delay: 1.0, duration: 4.6 },
  { id: 'm3', cx: 230, cy: 190, r: 2.5, color: '#FFFFFF', delay: 1.8, duration: 5.0 },
  { id: 'm4', cx: 315, cy: 160, r: 2.0, color: '#FBCFE8', delay: 0.5, duration: 4.8 },
  { id: 'm5', cx: 180, cy: 175, r: 2.2, color: '#BAE6FD', delay: 2.2, duration: 4.4 },
  { id: 'm6', cx: 260, cy: 140, r: 1.9, color: '#FFFFFF', delay: 1.4, duration: 4.5 },
  { id: 'm7', cx: 220, cy: 105, r: 2.4, color: '#DDD6FE', delay: 2.8, duration: 5.2 },
  { id: 'm8', cx: 275, cy: 95, r: 2.1, color: '#BAE6FD', delay: 0.8, duration: 4.7 },
  { id: 'm9', cx: 245, cy: 65, r: 2.6, color: '#FFFFFF', delay: 3.2, duration: 5.0 },
  { id: 'm10', cx: 265, cy: 45, r: 2.0, color: '#FBCFE8', delay: 2.0, duration: 4.8 },
];

export default function CinematicIntro({ onComplete }) {
  const navigate = useNavigate();
  const pathRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const authPromiseRef = useRef(null);

  const [elapsed, setElapsed] = useState(0);
  const [pathLength, setPathLength] = useState(360);
  const [isExiting, setIsExiting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // Measure exact SVG path length once mounted
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) setPathLength(len);
      } catch (e) {
        setPathLength(360);
      }
    }
  }, []);

  // Pre-verify authentication session asynchronously in the background during intro
  useEffect(() => {
    if (authService.hasStoredCredentials()) {
      authPromiseRef.current = authService.verifyCurrentSession();
    }
  }, []);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setElapsed(TOTAL_DURATION);
    }

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setElapsed(TOTAL_DURATION);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Reliable navigation handler according to verified authentication status
  const handleFinish = async () => {
    // Prevent duplicate navigation if timer and click occur simultaneously
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsExiting(true);

    // Cancel animation frame immediately so timer stops
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Save session flag so internal navigation never replays intro
    sessionStorage.setItem('pathly_intro_seen', 'true');

    // Determine authentication status safely without race conditions
    let isAuthenticated = false;
    if (authService.hasStoredCredentials()) {
      if (authService.isSessionVerified()) {
        isAuthenticated = true;
      } else {
        try {
          const verifyPromise = authPromiseRef.current || authService.verifyCurrentSession();
          // Timeout race: max 600ms so user navigation is never blocked
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 600));
          isAuthenticated = await Promise.race([verifyPromise, timeoutPromise]);
        } catch {
          isAuthenticated = false;
        }
      }
    } else {
      isAuthenticated = false;
    }

    const targetRoute = isAuthenticated ? '/dashboard' : '/welcome';

    // Execute navigation directly so destination page renders immediately without requiring refresh
    if (onComplete) {
      onComplete(targetRoute);
    } else {
      navigate(targetRoute, { replace: true });
    }
  };

  // 20-second high-precision animation loop
  useEffect(() => {
    if (prefersReducedMotion || isExiting) return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const secondsPassed = (timestamp - startTimeRef.current) / 1000;

      if (secondsPassed >= TOTAL_DURATION) {
        setElapsed(TOTAL_DURATION);
        handleFinish();
        return;
      }

      setElapsed(secondsPassed);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion, isExiting]);

  // Keyboard accessibility: Escape or Enter skips immediately
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Subtle interactive 3D parallax on mouse move
  const handleMouseMove = (e) => {
    const x = ((e.clientX / window.innerWidth) - 0.5) * 6;
    const y = ((e.clientY / window.innerHeight) - 0.5) * 6;
    setMouseTilt({ x, y });
  };

  // 20-Second Timeline Calculations
  // 0–4s: Open book smoothly unfolds
  const bookProgress = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, elapsed / 3.8));
  // 4–9s: Translucent glass learning path draws upward (5s duration)
  const pathProgress = prefersReducedMotion ? 1 : Math.min(1, Math.max(0, (elapsed - 4.0) / 5.0));
  // 9–13s: Milestone orbs appear sequentially
  const isOrb1Visible = prefersReducedMotion || elapsed >= 9.2;
  const isOrb2Visible = prefersReducedMotion || elapsed >= 10.4;
  const isOrb3Visible = prefersReducedMotion || elapsed >= 11.6;
  // Sparkles start twinkling at 9s
  const areSparklesVisible = prefersReducedMotion || elapsed >= 9.0;
  // 13–16s: Shimmer passes along the learning path
  const isShimmerActive = !prefersReducedMotion && elapsed >= 13.0 && elapsed <= 16.5;
  const shimmerProgress = Math.min(1, Math.max(0, (elapsed - 13.0) / 3.0));
  // Shimmer offset calculation along the 360px curve
  const shimmerOffset = (1 - shimmerProgress) * (pathLength + 55) - 55;
  // 13–16s: Pinnacle star illuminates
  const isStarVisible = prefersReducedMotion || elapsed >= 13.2;
  // 16–18s: Wordmark & Tagline reveal
  const isWordmarkVisible = prefersReducedMotion || elapsed >= 16.0;
  const isTaglineVisible = prefersReducedMotion || elapsed >= 16.8;

  // Path SVG stroke-dashoffset: draws upwards as pathProgress goes 0 -> 1
  const strokeDashoffset = pathLength * (1 - pathProgress);

  const remainingSeconds = Math.max(0, Math.ceil(TOTAL_DURATION - elapsed));

  // Elegant S-curve Ribbon Trajectory
  const ribbonCurveD = "M 250 335 C 205 310, 168 260, 190 230 C 215 196, 292 215, 322 178 C 346 148, 276 128, 240 108 C 224 98, 246 88, 250 85";

  // Stage Caption Text
  const stageCaption =
    elapsed < 4.0
      ? 'Opening The Path'
      : elapsed < 9.0
      ? 'Illuminating Journey'
      : elapsed < 13.0
      ? 'Setting Milestones'
      : elapsed < 16.0
      ? 'Starlight Convergence'
      : 'Your Journey Begins';

  return (
    <div
      className={`ref-intro-root ${isExiting ? 'ref-intro-exit' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Soft Ambient Pastel Lighting Gradients (Matching Reference Image) */}
      <div className="ref-intro-glow-top-right" />
      <div className="ref-intro-glow-bottom-left" />
      <div className="ref-intro-glow-center" />

      {/* Accessible "Skip Intro →" Button (Always Visible in Top Right) */}
      <button
        type="button"
        onClick={handleFinish}
        className="ref-skip-btn"
        title="Skip Intro (or press Escape)"
        aria-label="Skip Intro"
      >
        <span>Skip Intro</span>
        <ArrowRight size={15} />
        <span className="ref-skip-badge">{remainingSeconds}s</span>
      </button>

      {/* Centered Composition */}
      <div
        className="ref-composition"
        style={{
          transform: `translate3d(${mouseTilt.x}px, ${mouseTilt.y}px, 0)`,
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Subtle Stage Phase Pill */}
        <div className="ref-phase-pill">
          <Sparkles size={13} className="ref-phase-sparkle" />
          <span>{stageCaption}</span>
        </div>

        {/* 3D Layered Vector Emblem SVG matching Reference Image */}
        <div className="ref-emblem-container">
          <svg
            viewBox="0 0 500 480"
            className="ref-emblem-svg"
            aria-hidden="true"
          >
            <defs>
              {/* Reference Glass Gradients */}
              {/* Left Top Page (Glossy Ice Blue) */}
              <linearGradient id="refIceBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#C7D2FE" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.92" />
              </linearGradient>

              {/* Right Top Page (Glossy Pastel Lilac) */}
              <linearGradient id="refLilacGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#DDD6FE" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.9" />
              </linearGradient>

              {/* Middle Layer Glass Gradient */}
              <linearGradient id="refMidGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.75" />
              </linearGradient>

              {/* Bottom Book Base Gradient (Deep Violet Shading) */}
              <linearGradient id="refBookBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.75" />
              </linearGradient>

              {/* Translucent Glass Learning Path Gradient */}
              <linearGradient id="refPathRibbonGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#A78BFA" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.95" />
              </linearGradient>

              {/* Ribbon 3D Depth / Underside Shading */}
              <linearGradient id="refRibbonDepthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B21B6" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#6D28D9" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#3730A3" stopOpacity="0.8" />
              </linearGradient>

              {/* Specular White Ridge Highlights */}
              <linearGradient id="refSpecularGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
              </linearGradient>

              {/* Luminous Shimmer Traveling Pulse Gradient */}
              <linearGradient id="refShimmerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0" />
                <stop offset="30%" stopColor="#BAE6FD" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="70%" stopColor="#FBCFE8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
              </linearGradient>

              {/* Milestone Orb 1 (Pearlescent Lavender) */}
              <radialGradient id="refOrbGrad1" cx="32%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#DDD6FE" />
                <stop offset="70%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#7C3AED" />
              </radialGradient>

              {/* Milestone Orb 2 (Pearlescent Sky-Pink) */}
              <radialGradient id="refOrbGrad2" cx="32%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="32%" stopColor="#BAE6FD" />
                <stop offset="72%" stopColor="#FBCFE8" />
                <stop offset="100%" stopColor="#6366F1" />
              </radialGradient>

              {/* Milestone Orb 3 (Pearlescent Pearl-Lilac) */}
              <radialGradient id="refOrbGrad3" cx="32%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#F5D0FE" />
                <stop offset="70%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#9333EA" />
              </radialGradient>

              {/* Star Facet Gradients */}
              <linearGradient id="starFacetLit" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#DDD6FE" />
                <stop offset="100%" stopColor="#BAE6FD" />
              </linearGradient>

              <linearGradient id="starFacetShade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="70%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>

              {/* Filters for Soft Glass Glow, Shadows & Shimmer */}
              <filter id="refSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" />
              </filter>

              <filter id="refStarGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="refShimmerGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="refSparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. SOFT REALISTIC GROUND SHADOW (Beneath Book) */}
            <ellipse
              cx="250"
              cy="364"
              rx={110 * bookProgress}
              ry={18 * bookProgress}
              fill="rgba(124, 58, 237, 0.16)"
              filter="url(#refSoftShadow)"
              opacity={bookProgress}
            />

            {/* 2. THE OPEN 3D GLASS BOOK (0–4s Animation) */}
            <g
              id="refBookGroup"
              style={{
                opacity: bookProgress,
                transform: `translateY(${(1 - bookProgress) * 18}px)`,
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              {/* Center Crease Ambient Lighting */}
              <ellipse cx="250" cy="340" rx="36" ry="10" fill="url(#refMidGlassGrad)" opacity="0.6" />

              {/* LEFT GLASS WINGS (3 Layered Fan Pages) */}
              <g
                className="ref-book-left-wing"
                style={{
                  transformOrigin: '250px 338px',
                  transform: `rotateY(${(1 - bookProgress) * 38}deg)`,
                }}
              >
                {/* Bottom Base Page */}
                <path
                  d="M 250 348 C 205 354, 160 338, 128 316 C 122 312, 126 302, 134 301 C 172 300, 212 318, 250 336 Z"
                  fill="url(#refBookBaseGrad)"
                />
                {/* Middle Page with Bevel Edge */}
                <path
                  d="M 250 344 C 202 346, 154 326, 138 300 C 134 294, 139 286, 146 286 C 182 287, 218 308, 250 330 Z"
                  fill="url(#refMidGlassGrad)"
                  stroke="url(#refSpecularGrad)"
                  strokeWidth="1.2"
                />
                {/* Top Fore Page (Glossy Ice Blue with Brilliant Specular Rim) */}
                <path
                  d="M 250 340 C 196 338, 146 312, 138 278 C 136 270, 143 264, 150 265 C 186 270, 222 296, 250 324 Z"
                  fill="url(#refIceBlueGrad)"
                />
                {/* White Specular Edge Rail along curved top rim */}
                <path
                  d="M 144 272 C 164 268, 208 286, 250 324"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.95"
                />
              </g>

              {/* RIGHT GLASS WINGS (3 Layered Fan Pages) */}
              <g
                className="ref-book-right-wing"
                style={{
                  transformOrigin: '250px 338px',
                  transform: `rotateY(${(1 - bookProgress) * -38}deg)`,
                }}
              >
                {/* Bottom Base Page */}
                <path
                  d="M 250 348 C 295 354, 340 338, 372 316 C 378 312, 374 302, 366 301 C 328 300, 288 316, 250 336 Z"
                  fill="url(#refBookBaseGrad)"
                />
                {/* Middle Page */}
                <path
                  d="M 250 344 C 298 346, 346 326, 362 300 C 366 294, 361 286, 354 286 C 318 287, 282 308, 250 330 Z"
                  fill="url(#refMidGlassGrad)"
                  stroke="url(#refSpecularGrad)"
                  strokeWidth="1.2"
                />
                {/* Top Fore Page (Glossy Pastel Lilac with Specular Rim) */}
                <path
                  d="M 250 340 C 304 338, 354 310, 362 278 C 364 270, 357 264, 350 265 C 314 270, 278 296, 250 324 Z"
                  fill="url(#refLilacGrad)"
                />
                {/* White Specular Edge Rail along curved top rim */}
                <path
                  d="M 356 272 C 336 268, 292 286, 250 324"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.95"
                />
              </g>

              {/* Center Spine Glass Ridge */}
              <path
                d="M 248 320 C 249 330, 249 342, 250 348 C 251 342, 251 330, 252 320 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>

            {/* 3. WINDING TRANSLUCENT GLASS LEARNING PATH (4–9s Animation) */}
            <g
              id="refPathGroup"
              style={{
                opacity: elapsed >= 3.8 ? 1 : 0,
              }}
            >
              {/* Underlying 3D Depth / Violet Glass Shadow Ribbon */}
              <path
                d={ribbonCurveD}
                fill="none"
                stroke="url(#refRibbonDepthGrad)"
                strokeWidth="26"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLength}
                strokeDashoffset={strokeDashoffset}
                transform="translate(2, 4)"
                opacity="0.65"
              />

              {/* Soft Ambient Glow Halo */}
              <path
                d={ribbonCurveD}
                fill="none"
                stroke="rgba(167, 139, 250, 0.35)"
                strokeWidth="28"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                strokeDashoffset={strokeDashoffset}
                filter="url(#refSoftShadow)"
              />

              {/* Main Translucent Glass Ribbon */}
              <path
                ref={pathRef}
                d={ribbonCurveD}
                fill="none"
                stroke="url(#refPathRibbonGrad)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLength}
                strokeDashoffset={strokeDashoffset}
              />

              {/* Top Specular Edge Highlight Rail */}
              <path
                d={ribbonCurveD}
                fill="none"
                stroke="url(#refSpecularGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                strokeDashoffset={strokeDashoffset}
                transform="translate(-1, -2)"
                opacity="0.95"
              />

              {/* Luminous Center Glass Seam */}
              <path
                d={ribbonCurveD}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                strokeDashoffset={strokeDashoffset}
                opacity="0.75"
              />

              {/* Shimmer Pulse traveling along path from book toward star (13–16s) */}
              {isShimmerActive && (
                <path
                  d={ribbonCurveD}
                  fill="none"
                  stroke="url(#refShimmerGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`55 ${pathLength + 100}`}
                  strokeDashoffset={shimmerOffset}
                  filter="url(#refShimmerGlow)"
                  opacity={Math.sin(shimmerProgress * Math.PI) * 0.95}
                />
              )}
            </g>

            {/* 4. THREE SOFTLY GLOWING MILESTONE ORBS (9–13s Animation) */}
            {/* Milestone Orb 1: Lower Ribbon Bend (at 9.2s) */}
            {isOrb1Visible && (
              <g
                id="refMilestoneOrb1"
                transform="translate(240, 218)"
                className="ref-orb-pop ref-orb-float-1"
              >
                {/* Soft Contact Glass Shadow on Ribbon */}
                <ellipse cx="0" cy="11" rx="10" ry="3.5" fill="rgba(109, 40, 217, 0.3)" filter="url(#refSoftShadow)" />
                {/* Outer Glow Halo Ring */}
                <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(124, 58, 237, 0.35)" strokeWidth="1.5" className="ref-orb-ring-pulse" />
                {/* 3D Glass Pearl Sphere */}
                <circle cx="0" cy="0" r="11" fill="url(#refOrbGrad1)" />
                {/* Specular Glint */}
                <circle cx="-3.5" cy="-3.5" r="3.2" fill="#FFFFFF" opacity="0.95" />
                {/* Micro twinkling dots near Orb 1 */}
                <circle cx="12" cy="-6" r="1.5" fill="#BAE6FD" className="ref-micro-glint" />
                <circle cx="-10" cy="8" r="1.2" fill="#FFFFFF" className="ref-micro-glint-alt" />
              </g>
            )}

            {/* Milestone Orb 2: Middle Right Bend (at 10.4s) */}
            {isOrb2Visible && (
              <g
                id="refMilestoneOrb2"
                transform="translate(293, 164)"
                className="ref-orb-pop ref-orb-float-2"
              >
                <ellipse cx="0" cy="9" rx="8" ry="3" fill="rgba(2, 132, 199, 0.3)" filter="url(#refSoftShadow)" />
                <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" className="ref-orb-ring-pulse" />
                <circle cx="0" cy="0" r="9.2" fill="url(#refOrbGrad2)" />
                <circle cx="-3" cy="-3" r="2.8" fill="#FFFFFF" opacity="0.95" />
                {/* Micro twinkling dots near Orb 2 */}
                <circle cx="-11" cy="-5" r="1.4" fill="#FBCFE8" className="ref-micro-glint" />
                <circle cx="9" cy="7" r="1.2" fill="#FFFFFF" className="ref-micro-glint-alt" />
              </g>
            )}

            {/* Milestone Orb 3: Upper Loop (at 11.6s) */}
            {isOrb3Visible && (
              <g
                id="refMilestoneOrb3"
                transform="translate(256, 118)"
                className="ref-orb-pop ref-orb-float-3"
              >
                <ellipse cx="0" cy="7.5" rx="7" ry="2.5" fill="rgba(147, 51, 234, 0.28)" filter="url(#refSoftShadow)" />
                <circle cx="0" cy="0" r="12" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="1.5" className="ref-orb-ring-pulse" />
                <circle cx="0" cy="0" r="7.8" fill="url(#refOrbGrad3)" />
                <circle cx="-2.5" cy="-2.5" r="2.3" fill="#FFFFFF" opacity="0.95" />
                {/* Micro twinkling dot near Orb 3 */}
                <circle cx="8" cy="-5" r="1.3" fill="#DDD6FE" className="ref-micro-glint" />
              </g>
            )}

            {/* 5. FOUR-POINT LAVENDER-BLUE SPARKLING STAR (13–16s Animation) */}
            {isStarVisible && (
              <g
                id="refPinnacleStar"
                transform="translate(250, 72)"
                className="ref-star-reveal"
              >
                {/* Rotating Ambient Diamond Rays */}
                <g className="ref-star-glimmer-rays">
                  <line x1="-24" y1="0" x2="24" y2="0" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
                  <line x1="0" y1="-28" x2="0" y2="28" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
                </g>

                {/* 4-Point Faceted Diamond Star Body (Matching Reference) */}
                <g filter="url(#refStarGlow)" className="ref-star-body">
                  {/* North-West Facet (Lit Pearlescent) */}
                  <path d="M 0 0 L 0 -30 L -20 0 Z" fill="url(#starFacetLit)" />
                  {/* North-East Facet (Medium Blue-Violet) */}
                  <path d="M 0 0 L 0 -30 L 20 0 Z" fill="url(#starFacetShade)" />
                  {/* South-West Facet (Shaded Royal Violet) */}
                  <path d="M 0 0 L 0 22 L -20 0 Z" fill="url(#starFacetShade)" />
                  {/* South-East Facet (Soft Lilac-Cyan) */}
                  <path d="M 0 0 L 0 22 L 20 0 Z" fill="url(#starFacetLit)" />

                  {/* Center Diamond Facet Specular Highlight */}
                  <polygon points="0,-7 7,0 0,7 -7,0" fill="#FFFFFF" opacity="0.96" />
                  {/* Center Brilliant Core */}
                  <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
                </g>
              </g>
            )}

            {/* 6. SUBTLE LAYERED SPARKLES ✨ (Appear starting at 9s) */}
            {areSparklesVisible && (
              <g id="refSparklesGroup">
                {SPARKLES.map((sp) => (
                  <g
                    key={sp.id}
                    transform={`translate(${sp.cx}, ${sp.cy})`}
                    className="ref-sparkle-item"
                    style={{
                      animationDelay: `${sp.delay}s`,
                      animationDuration: `${sp.duration}s`,
                    }}
                    filter="url(#refSparkleGlow)"
                  >
                    {/* 4-Point Diamond Sparkle */}
                    <path
                      d={`M 0,-${sp.r} Q 0,0 ${sp.r},0 Q 0,0 0,${sp.r} Q 0,0 -${sp.r},0 Q 0,0 0,-${sp.r}`}
                      fill={sp.color}
                    />
                    <circle cx="0" cy="0" r={sp.r * 0.3} fill="#FFFFFF" />
                  </g>
                ))}

                {/* Gently Floating Stardust Motes */}
                {FLOATING_MOTES.map((mote) => (
                  <circle
                    key={mote.id}
                    cx={mote.cx}
                    cy={mote.cy}
                    r={mote.r}
                    fill={mote.color}
                    className="ref-floating-mote"
                    style={{
                      animationDelay: `${mote.delay}s`,
                      animationDuration: `${mote.duration}s`,
                    }}
                  />
                ))}
              </g>
            )}
          </svg>
        </div>

        {/* 7. EXACT WORDMARK "Pathly AI" (16–18s Animation) */}
        {isWordmarkVisible && (
          <div className="ref-wordmark-container">
            <span className="ref-wordmark-pathly">Pathly</span>
            <span className="ref-wordmark-ai">AI</span>
          </div>
        )}

        {/* 8. TAGLINE "Your Learning Journey, Personalized" (16–18s Animation) */}
        {isTaglineVisible && (
          <p className="ref-tagline-text">
            Your Learning Journey, Personalized
          </p>
        )}
      </div>

      {/* Screen Bottom Minimal Progress Line */}
      <div className="ref-bottom-track">
        <div
          className="ref-bottom-fill"
          style={{ width: `${Math.min(100, (elapsed / TOTAL_DURATION) * 100)}%` }}
        />
      </div>
    </div>
  );
}
