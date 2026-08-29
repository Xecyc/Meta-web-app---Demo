import React from 'react';
import { ScanLine, Zap, ZapOff, RefreshCw, X } from 'lucide-react';

interface ScannerHeaderProps {
  branchName: string;
  isTorchOn: boolean;
  hasTorchSupport: boolean;
  onToggleTorch: () => void;
  onFlipCamera: () => void;
  onClose: () => void;
}

export const ScannerHeader: React.FC<ScannerHeaderProps> = ({
  branchName,
  isTorchOn,
  hasTorchSupport,
  onToggleTorch,
  onFlipCamera,
  onClose,
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-b from-black/95 via-black/80 to-transparent text-white border-b border-white/10">
      {/* Brand & Sede indicator */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
          <ScanLine className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-1.5 font-heading">
            Escáner Óptico de Precios
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold rounded border border-emerald-400/30">
              ACTIVO
            </span>
          </span>
          <span className="text-[11px] text-slate-300 truncate max-w-[160px] sm:max-w-[260px]">
            {branchName}
          </span>
        </div>
      </div>

      {/* Top Actions: Torch, Camera Flip, Close */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Torch / Flash Toggle */}
        <button
          id="scanner-torch-btn"
          type="button"
          onClick={onToggleTorch}
          title={hasTorchSupport ? (isTorchOn ? 'Apagar Linterna' : 'Encender Linterna') : 'Linterna no disponible'}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isTorchOn 
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40 ring-2 ring-amber-300' 
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
        >
          {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
        </button>

        {/* Camera Flip */}
        <button
          id="scanner-flip-camera-btn"
          type="button"
          onClick={onFlipCamera}
          title="Cambiar Cámara (Frontal / Trasera)"
          className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all active:rotate-180 duration-300 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Close Button */}
        <button
          id="scanner-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Cerrar Escáner"
          className="w-9 h-9 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 ml-1 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};
