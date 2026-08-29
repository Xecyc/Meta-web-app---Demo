import React from 'react';

interface MetaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  transparentBackground?: boolean;
}

export const MetaLogo: React.FC<MetaLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  onClick,
  transparentBackground = false,
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    header: 'w-11 h-11 sm:w-13 sm:h-13',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      id="meta-brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
      title="Supertiendas Meta"
    >
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm overflow-visible"
        >
          {/* Optional Red Background (when rendered on non-red surfaces) */}
          {!transparentBackground && (
            <rect width="100" height="100" rx="14" fill="#c8102e" />
          )}

          {/* 1. TOP BLUE STAR OUTLINE */}
          <path
            d="M 21 44.5 L 14 41 L 39 37.5 L 50 15 L 61 37.5 L 86 41 L 79 44.5"
            stroke="#0044ff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* 2. BOTTOM BLUE STAR OUTLINE */}
          <path
            d="M 29 65.5 L 27.5 83.5 L 50 71 L 72.5 83.5 L 71 65.5"
            stroke="#0044ff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* 3. TOP WHITE SWOOSH (Refined 2.5px arc gracefully floating above META) */}
          <path
            d="M 8 50 Q 44 44.5 80 47"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. CENTRAL 'META' TEXT (Calibrated size & spacing) */}
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="15"
            fontWeight="900"
            fontFamily="'Arial Black', 'Impact', 'Montserrat', -apple-system, sans-serif"
            letterSpacing="0.8"
            style={{
              fontStyle: 'normal',
              textTransform: 'uppercase',
            }}
          >
            META
          </text>

          {/* 5. BOTTOM WHITE SWOOSH (Refined 2.5px arc sweeping smoothly under META) */}
          <path
            d="M 28 62.5 Q 58 63.5 86 67"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {showSubtitle && (
        <div className="flex flex-col leading-none text-left">
          <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wider uppercase">
            Supertiendas
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight">
            META
          </span>
        </div>
      )}
    </div>
  );
};
