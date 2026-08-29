import React from 'react';
import { Hash, Sparkles } from 'lucide-react';

interface ScannerFooterProps {
  onOpenManualInput: () => void;
  onOpenSamples: () => void;
}

export const ScannerFooter: React.FC<ScannerFooterProps> = ({
  onOpenManualInput,
  onOpenSamples,
}) => {
  return (
    <footer className="relative z-30 pb-5 pt-3 px-4 sm:px-6 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center gap-2.5 border-t border-white/10">
      {/* Quick Action Buttons Centered at bottom */}
      <div className="flex items-center justify-center gap-3 w-full max-w-sm">
        <button
          id="scanner-quick-manual-btn"
          type="button"
          onClick={onOpenManualInput}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-slate-200 border border-white/20 text-xs font-bold backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Hash className="w-4 h-4 text-slate-300" />
          <span>Código Manual</span>
        </button>
        <button
          id="scanner-quick-samples-btn"
          type="button"
          onClick={onOpenSamples}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/30 text-xs font-bold backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Códigos Demo</span>
        </button>
      </div>

      {/* Status Indicator */}
      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 bg-black/40 px-3 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Detección Automática Inteligente Supertiendas Meta</span>
      </div>
    </footer>
  );
};
