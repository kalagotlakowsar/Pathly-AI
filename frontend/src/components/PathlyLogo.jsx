import React, { useState, useRef, useEffect } from 'react';

/**
 * PathlyLogo — Premium 3D Animated Branding Component
 * 
 * Features:
 * - 3D Perspective Scene with interactive mouse tilt
 * - Translucent glass open book settling into place
 * - Helical lavender-blue learning path drawing upward
 * - 3 glowing milestone orbs floating with soft specular highlights
 * - 4-point crystal star with animated sparkle flares
 * - Crisp wordmark reveal and tagline
 * - Responsive sizes: 'splash' (large), 'auth' (medium), 'nav' (compact), 'icon' (small)
 */
export default function PathlyLogo({
  size = 'splash', // 'splash' | 'auth' | 'nav' | 'icon'
  animated = true,
  showWordmark = true,
  showTagline = true,
  interactive = true,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Size dimensions
  const dimensions = {
    splash: { width: 280, height: 280, textScale: 1 },
    auth: { width: 140, height: 140, textScale: 0.8 },
    nav: { width: 38, height: 38, textScale: 0.6 },
    icon: { width: 28, height: 28, textScale: 0.5 },
  }[size] || { width: 140, height: 140, textScale: 0.8 };

  // Mouse tilt effect for splash & auth sizes
  const handleMouseMove = (e) => {
    if (!interactive || size === 'nav' || size === 'icon' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Limit tilt to gentle range (-8 to +8 deg)
    const rotateX = -(y / (rect.height / 2)) * 7;
    const rotateY = (x / (rect.width / 2)) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (interactive && (size === 'splash' || size === 'auth')) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const isSplash = size === 'splash';
  const isNav = size === 'nav' || size === 'icon';

  const transformStyle = isHovered
    ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`pathly-3d-scene ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        padding: isSplash ? '12px' : '0',
      }}
    >
      {/* 3D Floating Emblem Wrapper */}
      <div
        className={`pathly-3d-emblem ${animated && !isNav ? 'pathly-floating-active' : ''}`}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: transformStyle,
        }}
      >
        {/* Soft Radial Ambient Lighting Glow */}
        {!isNav && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${dimensions.width * 1.3}px`,
              height: `${dimensions.height * 1.3}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.28) 0%, rgba(56, 189, 248, 0.15) 45%, transparent 70%)',
              filter: 'blur(28px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* 3D Layered Glass Emblem SVG */}
        <svg
          viewBox="0 0 400 400"
          width="100%"
          height="100%"
          style={{
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
            display: 'block',
          }}
        >
          <defs>
            {/* Gradients */}
            {/* Book Spine Glow */}
            <radialGradient id="spineGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </radialGradient>

            {/* Left Glass Pages Gradient */}
            <linearGradient id="leftPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#C7D2FE" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.9" />
            </linearGradient>

            {/* Right Glass Pages Gradient */}
            <linearGradient id="rightPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#C4B5FD" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.85" />
            </linearGradient>

            {/* Winding Ribbon Front / Top Surface */}
            <linearGradient id="ribbonTopGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#A78BFA" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#93C5FD" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.98" />
            </linearGradient>

            {/* Winding Ribbon Underside / 3D Depth */}
            <linearGradient id="ribbonDepthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.9" />
            </linearGradient>

            {/* Glass Edge Specular Highlight */}
            <linearGradient id="specularHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
            </linearGradient>

            {/* 3D Milestone Orb 1 (Iridescent Lavender) */}
            <radialGradient id="orbGrad1" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#E9D5FF" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#A78BFA" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.85" />
            </radialGradient>

            {/* 3D Milestone Orb 2 (Iridescent Cyan-Pink) */}
            <radialGradient id="orbGrad2" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="35%" stopColor="#BAE6FD" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#FBCFE8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.85" />
            </radialGradient>

            {/* 3D Milestone Orb 3 (Radiant Pearl) */}
            <radialGradient id="orbGrad3" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#F5D0FE" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#C4B5FD" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.85" />
            </radialGradient>

            {/* Star Crystal Gradient */}
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#E0E7FF" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#818CF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.95" />
            </linearGradient>

            {/* Soft Drop Filters */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. LAYER: OPEN GLASS BOOK */}
          <g id="openBookGroup" transform="translate(0, 10)">
            {/* Center Spine Glow */}
            <ellipse cx="200" cy="245" rx="35" ry="12" fill="url(#spineGlow)" />

            {/* LEFT PAGES (Layered Translucent Wings) */}
            <g className={animated ? 'pathly-book-left' : ''}>
              {/* Bottom Back Page */}
              <path
                d="M 200 248 C 160 252, 125 240, 102 225 C 98 223, 100 216, 105 215 C 132 214, 168 226, 200 238 Z"
                fill="url(#leftPageGrad)"
                opacity="0.65"
              />
              {/* Middle Page with Bevel Edge */}
              <path
                d="M 200 245 C 158 248, 120 234, 110 216 C 108 213, 111 208, 116 208 C 145 208, 175 220, 200 234 Z"
                fill="url(#leftPageGrad)"
                opacity="0.8"
                stroke="url(#specularHighlight)"
                strokeWidth="1.2"
              />
              {/* Top Fore Page with Specular Shine */}
              <path
                d="M 200 242 C 162 242, 128 225, 118 202 C 116 199, 120 195, 125 195 C 152 196, 180 212, 200 230 Z"
                fill="url(#leftPageGrad)"
                opacity="0.95"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
            </g>

            {/* RIGHT PAGES (Layered Translucent Wings) */}
            <g className={animated ? 'pathly-book-right' : ''}>
              {/* Bottom Back Page */}
              <path
                d="M 200 248 C 240 252, 275 240, 298 225 C 302 223, 300 216, 295 215 C 268 214, 232 226, 200 238 Z"
                fill="url(#rightPageGrad)"
                opacity="0.65"
              />
              {/* Middle Page */}
              <path
                d="M 200 245 C 242 248, 280 234, 290 216 C 292 213, 289 208, 284 208 C 255 208, 225 220, 200 234 Z"
                fill="url(#rightPageGrad)"
                opacity="0.8"
                stroke="url(#specularHighlight)"
                strokeWidth="1.2"
              />
              {/* Top Fore Page with Specular Shine */}
              <path
                d="M 200 242 C 238 242, 272 225, 282 202 C 284 199, 280 195, 275 195 C 248 196, 220 212, 200 230 Z"
                fill="url(#rightPageGrad)"
                opacity="0.95"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
            </g>

            {/* Spine Center Glass Ridge */}
            <path
              d="M 197 228 C 199 235, 199 245, 200 250 C 201 245, 201 235, 203 228 Z"
              fill="#FFFFFF"
              opacity="0.8"
            />
          </g>

          {/* 2. LAYER: HELICAL LEARNING PATH / WINDING RIBBON */}
          <g
            id="windingPathGroup"
            className={`${animated ? 'pathly-path-ribbon' : ''} ${animated && !isNav ? 'pathly-path-glow' : ''}`}
          >
            {/* Ribbon Underside (Darker Violet 3D Depth Shading) */}
            <path
              d="M 194 235
                 C 175 225, 155 198, 160 165
                 C 165 130, 200 120, 235 130
                 C 260 138, 268 162, 258 182
                 C 245 208, 212 218, 198 238 Z"
              fill="url(#ribbonDepthGrad)"
              opacity="0.75"
            />

            {/* Main Winding Translucent Ribbon (S-Curve Spiral) */}
            <path
              d="M 200 236
                 C 178 215, 158 185, 166 148
                 C 174 112, 218 102, 246 122
                 C 268 138, 266 172, 238 194
                 C 205 220, 185 228, 196 237
                 C 205 244, 216 230, 226 215
                 C 255 175, 260 135, 240 108
                 C 220 82, 182 88, 198 120
                 C 208 140, 230 148, 234 165 Z"
              fill="url(#ribbonTopGrad)"
              opacity="0.88"
            />

            {/* Upper Spiral Rising Towards the Star */}
            <path
              d="M 198 135
                 C 185 105, 202 75, 225 65
                 C 234 60, 240 68, 235 76
                 C 220 95, 208 118, 215 142 Z"
              fill="url(#ribbonTopGrad)"
              opacity="0.9"
            />

            {/* Specular White Ribbon Edge Rails */}
            <path
              d="M 200 238
                 C 175 210, 156 178, 166 145
                 C 176 110, 218 100, 248 122
                 C 268 138, 266 170, 240 192"
              fill="none"
              stroke="url(#specularHighlight)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 202 125
                 C 192 98, 212 72, 232 64"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.95"
            />
          </g>

          {/* 3. LAYER: 3 FLOATING MILESTONE ORBS */}
          {/* Orb 1: Lower Turn */}
          <g
            className={animated ? 'pathly-orb pathly-orb-1' : ''}
            transform="translate(192, 172)"
          >
            <circle cx="0" cy="0" r="13" fill="url(#orbGrad1)" />
            {/* Specular Glint */}
            <circle cx="-4" cy="-4" r="3.5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Orb 2: Middle Turn */}
          <g
            className={animated ? 'pathly-orb pathly-orb-2' : ''}
            transform="translate(236, 126)"
          >
            <circle cx="0" cy="0" r="11" fill="url(#orbGrad2)" />
            <circle cx="-3.5" cy="-3.5" r="3" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Orb 3: Upper Apex */}
          <g
            className={animated ? 'pathly-orb pathly-orb-3' : ''}
            transform="translate(206, 88)"
          >
            <circle cx="0" cy="0" r="8.5" fill="url(#orbGrad3)" />
            <circle cx="-2.5" cy="-2.5" r="2.2" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* 4. LAYER: SPARKLING PINNACLE STAR */}
          <g
            className={animated ? 'pathly-star-container' : ''}
            transform="translate(235, 52)"
          >
            {/* Spinning Diamond Glimmer Rays */}
            <g className={animated && !isNav ? 'pathly-star-glimmer' : ''} opacity="0.8">
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Main 4-Point Faceted Diamond Star */}
            <g className={animated && !isNav ? 'pathly-star-sparkle' : ''} filter="url(#starGlow)">
              {/* North Ray */}
              <path d="M 0 0 L -4 -4 L 0 -24 L 4 -4 Z" fill="url(#starGrad)" />
              {/* South Ray */}
              <path d="M 0 0 L -4 4 L 0 24 L 4 4 Z" fill="url(#starGrad)" />
              {/* East Ray */}
              <path d="M 0 0 L 4 -4 L 24 0 L 4 4 Z" fill="url(#starGrad)" />
              {/* West Ray */}
              <path d="M 0 0 L -4 -4 L -24 0 L -4 4 Z" fill="url(#starGrad)" />
              
              {/* Center Diamond Facet */}
              <polygon points="0,-7 7,0 0,7 -7,0" fill="#FFFFFF" opacity="0.95" />
              {/* Center Brilliant Core */}
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
            </g>
          </g>
        </svg>

        {/* 3D Realistic Ground Shadow */}
        {!isNav && <div className="pathly-3d-shadow" />}
      </div>

      {/* Wordmark Reveal */}
      {showWordmark && (
        <div
          className={`pathly-wordmark ${animated ? '' : 'style-visible'}`}
          style={{
            marginTop: isSplash ? '18px' : '10px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              style={{
                fontSize: isSplash ? '2.5rem' : isNav ? '1.25rem' : '1.8rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #4338CA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}
            >
              Pathly
            </span>
            <span
              style={{
                fontSize: isSplash ? '1.1rem' : isNav ? '0.7rem' : '0.85rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                background: 'linear-gradient(135deg, #7C3AED, #38BDF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}
            >
              AI
            </span>
          </div>

          {showTagline && (
            <p
              className={animated ? 'pathly-tagline' : ''}
              style={{
                fontSize: isSplash ? '0.98rem' : '0.82rem',
                color: 'var(--text-muted)',
                fontWeight: '500',
                letterSpacing: '0.02em',
                marginTop: '6px',
                lineHeight: '1.4',
              }}
            >
              Your Learning Journey, Personalized
            </p>
          )}
        </div>
      )}
    </div>
  );
}
