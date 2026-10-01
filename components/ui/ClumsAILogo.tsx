'use client'

import React from 'react'

interface ClumsAILogoProps {
  /** Height in px — width scales proportionally (default 32) */
  height?: number
  /** Show full wordmark + tagline (default: mark + wordmark only) */
  showTagline?: boolean
  /** Override text color for dark backgrounds */
  darkMode?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * ClumsAI brand mark — inline SVG, no image dependency.
 * Hard-hat silhouette merged with a neural-circuit pattern,
 * "Clums" in navy + "AI" in safety orange.
 */
export function ClumsAILogo({
  height = 32,
  showTagline = false,
  darkMode = false,
  className,
  style,
}: ClumsAILogoProps) {
  const iconSize = height
  const textColor = darkMode ? '#ffffff' : '#0f172a'
  const subColor = darkMode ? 'rgba(255,255,255,0.6)' : '#64748b'
  const orange = '#f97316'
  const orangeDark = '#ea580c'
  const brimColor = darkMode ? '#0f172a' : '#1e293b'

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: height * 0.28,
        userSelect: 'none',
        ...style,
      }}
    >
      {/* ── Icon mark: Clean Safety Hard Hat ── */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="clumsai-hat-grad" x1="12" y1="6" x2="36" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor={orangeDark} />
          </linearGradient>
        </defs>
        {/* Hat Dome */}
        <path
          d="M7 28 C7 15 14 7 24 7 C34 7 41 15 41 28 Z"
          fill="url(#clumsai-hat-grad)"
        />
        {/* Center Ridge */}
        <path
          d="M21 7.5 C22.5 7 25.5 7 27 7.5 L28.5 28 L19.5 28 Z"
          fill={orangeDark}
          opacity="0.9"
        />
        {/* Hat Brim Band */}
        <rect x="5" y="27" width="38" height="4.5" rx="2" fill={brimColor} />
        {/* Hat Visor Lip */}
        <rect x="3" y="30.5" width="42" height="3" rx="1.5" fill={orange} />
      </svg>

      {/* ── Wordmark ── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: height * 0.58,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: textColor,
            fontFamily: 'inherit',
          }}
        >
          Clums<span style={{ color: orange }}>AI</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontSize: height * 0.22,
              fontWeight: 600,
              color: subColor,
              letterSpacing: '0.02em',
              lineHeight: 1,
              marginTop: 3,
            }}
          >
            Build Safer. Certify Smarter.
          </div>
        )}
      </div>
    </div>
  )
}

export default ClumsAILogo
