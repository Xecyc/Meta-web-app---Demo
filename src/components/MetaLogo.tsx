import React from 'react';
import { ShoppingBag } from 'lucide-react';

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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    header: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    header: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size];

  return (
    <div
      id="brand-logo-container"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
      title="SuperTienda"
    >
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl transition-transform group-hover:scale-105 shadow-sm ${sizeClasses} ${
          transparentBackground
            ? 'bg-white/15 text-white border border-white/20'
            : 'bg-[#c8102e] text-white'
        }`}
      >
        <ShoppingBag className={`${iconSizes} text-amber-300 drop-shadow-xs`} />
      </div>

      {showSubtitle && (
        <div className="flex flex-col leading-tight text-left">
          <span className="text-[10px] sm:text-[11px] font-black text-amber-300 tracking-wider uppercase">
            Catálogo Digital
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight">
            SuperTienda
          </span>
        </div>
      )}
    </div>
  );
};

