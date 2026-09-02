import React from 'react';
import { Calculator, ChevronRight, Radio } from 'lucide-react';
import { formatVeCurrency } from '../utils/currency';

interface ExchangeBannerProps {
  exchangeRate: number;
  onOpenCalculator?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  lastUpdatedApi?: string | null;
  isAutoUpdated?: boolean;
}

export const ExchangeBanner: React.FC<ExchangeBannerProps> = ({
  exchangeRate,
  onOpenCalculator,
  isRefreshing = false,
  onRefresh,
  lastUpdatedApi,
}) => {
  const formattedRate = formatVeCurrency(exchangeRate);

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
        {/* Left Side: Live status dot, DolarAPI badge & rate */}
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRefreshing ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRefreshing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>

          <span className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1">
            <span>Tasa BCV:</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              DolarAPI
            </span>
          </span>

          <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-tight">
            $1 USD = {formattedRate} Bsd
          </span>
        </div>

        {/* Right Side: Calculator CTA button */}
        <div className="flex items-center gap-1.5 shrink-0">
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


