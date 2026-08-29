import React from 'react';
import { Calculator, ChevronRight } from 'lucide-react';

interface ExchangeBannerProps {
  exchangeRate: number;
  onOpenCalculator?: () => void;
}

export const ExchangeBanner: React.FC<ExchangeBannerProps> = ({
  exchangeRate,
  onOpenCalculator,
}) => {
  const formattedRate = exchangeRate.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      id="exchange-rate-banner-container"
      onClick={onOpenCalculator}
      role={onOpenCalculator ? 'button' : undefined}
      tabIndex={onOpenCalculator ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpenCalculator && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpenCalculator();
        }
      }}
      className={`w-full bg-[#0a192f] border-b border-slate-800/80 text-white select-none whitespace-nowrap transition-colors ${
        onOpenCalculator ? 'cursor-pointer group hover:bg-[#0d213f] active:bg-[#081426]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex flex-row items-center justify-between gap-2 text-xs">
        {/* Left Side: Live status dot, label & rate on a single row */}
        <div className="flex flex-row items-center gap-1.5 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <span className="text-xs sm:text-sm font-medium text-slate-300">
            Tasa BCV:
          </span>

          <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-tight">
            $1 USD = {formattedRate} Bsd
          </span>
        </div>

        {/* Right Side: Anchor compact pill calculator CTA button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            id="open-bcv-calculator-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCalculator?.();
            }}
            className="rounded-full px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 flex items-center gap-1 text-xs text-white font-semibold shrink-0 transition-colors shadow-xs cursor-pointer group-hover:border-slate-600"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400 group-hover:scale-105 transition-transform" />
            <span>Calculadora</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};


