import React from 'react';

interface CodeticzLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showBadge?: boolean;
  withGlow?: boolean;
  useImage?: boolean;
}

export const CodeticzLogo: React.FC<CodeticzLogoProps> = ({
  size = 'md',
  className = '',
  showBadge = false,
  withGlow = true,
  useImage = false,
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      case 'xl':
        return 64;
      case 'md':
      default:
        return 40;
    }
  };

  const dim = getDimension();
  const iconSize = showBadge ? Math.round(dim * 0.65) : dim;

  const svgContent = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="bracketLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F4F7FB" />
        </linearGradient>

        <linearGradient id="slashGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5A1F" />
          <stop offset="50%" stopColor="#FF304F" />
          <stop offset="100%" stopColor="#F4F7FB" />
        </linearGradient>

        <linearGradient id="bracketRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5A1F" />
          <stop offset="100%" stopColor="#FF304F" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="accentDotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="symbolGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={withGlow ? "url(#symbolGlow)" : undefined}>
        {/* Left Bracket: < */}
        <path
          d="M 12 11 L 4 20 L 12 29"
          stroke="url(#bracketLeftGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Slash: / */}
        <path
          d="M 23 9 L 15 31"
          stroke="url(#slashGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Right Bracket: > */}
        <path
          d="M 26 11 L 34 20 L 26 29"
          stroke="url(#bracketRightGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Accent Dot: . with Codeticz Orange glow */}
      <circle
        cx="36"
        cy="31"
        r="2.6"
        fill="#FF5A1F"
        filter="url(#accentDotGlow)"
        className="animate-pulse"
      />
      <circle
        cx="36"
        cy="31"
        r="1.3"
        fill="#F4F7FB"
      />
    </svg>
  );

  if (!showBadge) {
    if (useImage) {
      return (
        <img
          src="/logo.png"
          alt="Codeticz Logo"
          width={dim}
          height={dim}
          className={`object-contain inline-block drop-shadow-[0_0_14px_rgba(255,90,31,0.65)] ${className}`}
        />
      );
    }
    return (
      <div className={`inline-flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(255,90,31,0.5)] drop-shadow-[0_0_18px_rgba(244,247,251,0.2)] ${className}`}>
        {svgContent}
      </div>
    );
  }

  return (
    <div
      style={{ width: `${dim}px`, height: `${dim}px` }}
      className={`rounded-xl bg-gradient-to-br from-[#121620] via-[#1A202C] to-[#080A0F] border border-[#FF5A1F]/40 flex items-center justify-center relative shadow-[0_0_18px_rgba(255,90,31,0.3)] transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,90,31,0.55)] hover:border-[#FF5A1F] ${className}`}
    >
      {/* Ambient background glow inside badge */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF5A1F]/15 via-transparent to-[#FF304F]/10 pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-center">
        {svgContent}
      </div>
    </div>
  );
};

export default CodeticzLogo;
