import React from 'react';
import { Camera, RefreshCw, AlertCircle, Sparkles, Hash } from 'lucide-react';
import { CameraState, StatusType, ScanResult } from './types';

interface ScannerViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  errorMessage: string;
  statusMessage: string;
  statusType: StatusType;
  detectedResult: ScanResult | null;
  onOpenSamples: () => void;
  onOpenManualInput: () => void;
}

export const ScannerViewport: React.FC<ScannerViewportProps> = ({
  videoRef,
  cameraState,
  errorMessage,
  statusMessage,
  statusType,
  detectedResult,
  onOpenSamples,
  onOpenManualInput,
}) => {
  return (
    <main className="relative flex-1 min-h-[360px] md:min-h-[420px] flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Actual HTML Video Stream */}
      <video
        ref={videoRef}
        id="scanner-video-element"
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          cameraState === 'active' ? 'opacity-100' : 'opacity-20'
        }`}
      />

      {/* Fallback Background / Grid Pattern when camera is inactive/denied/requesting */}
      {cameraState !== 'active' && (
        <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-xl">
            {cameraState === 'requesting' ? (
              <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            ) : cameraState === 'denied' ? (
              <AlertCircle className="w-8 h-8 text-amber-400" />
            ) : (
              <Camera className="w-8 h-8 text-slate-300" />
            )}
          </div>

          <h3 className="text-base font-extrabold text-white mb-1">
            {cameraState === 'requesting'
              ? 'Conectando a la cámara...'
              : cameraState === 'denied'
              ? 'Acceso a la cámara restringido'
              : 'Modo Escáner Activo'}
          </h3>

          <p className="text-xs text-slate-300 max-w-xs mb-5 leading-relaxed">
            {errorMessage || 'Puedes probar el escaneo inmediato usando nuestros códigos de muestra o ingresar el código manualmente.'}
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              type="button"
              onClick={onOpenSamples}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Probar Códigos de Muestra
            </button>
            <button
              type="button"
              onClick={onOpenManualInput}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold rounded-xl backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5" />
              Ingreso Manual
            </button>
          </div>
        </div>
      )}

      {/* GLOWING TARGETING RETICLE ("Scan Area") */}
      <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none w-full max-w-sm px-6 py-4">
        {/* Status Notification Pill */}
        <div className="mb-4">
          <div
            id="scanner-status-pill"
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 backdrop-blur-md border shadow-xl transition-all duration-300 ${
              statusType === 'green'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30'
                : statusType === 'blue'
                ? 'bg-sky-950/80 border-sky-500/60 text-sky-300 ring-1 ring-sky-500/30'
                : statusType === 'yellow'
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-red-950/80 border-red-500/60 text-red-300 ring-1 ring-red-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-ping ${
              statusType === 'green' ? 'bg-emerald-400' : statusType === 'blue' ? 'bg-sky-400' : 'bg-amber-400'
            }`} />
            <span>{statusMessage}</span>
          </div>
        </div>

        {/* Centered Reticle Frame */}
        <div
          id="scanner-target-frame"
          className="relative w-full aspect-[4/3] max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border border-white/20 bg-black/10 backdrop-contrast-125 shadow-2xl"
        >
          {/* 4 Glowing Corner Guides */}
          <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

          {/* Center Aim Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-6 h-0.5 bg-emerald-300" />
            <div className="h-6 w-0.5 bg-emerald-300 absolute" />
          </div>

          {/* Animated Laser Scanline */}
          {!detectedResult && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] animate-[bounce_2.4s_infinite_ease-in-out]" />
          )}
        </div>

        <p className="text-[11px] text-slate-300/80 text-center mt-3 font-medium">
          Coloque el código de barras o etiqueta dentro del recuadro
        </p>
      </div>
    </main>
  );
};
