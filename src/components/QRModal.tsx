import React from 'react';
import { X, QrCode, Smartphone, Sparkles, Store } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, branchName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="qr-modal-card"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-center"
      >
        <div className="bg-[#0f2b48] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-red-500" />
            <span className="text-sm font-bold font-heading">Escáner QR en Tienda</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 border-2 border-dashed border-red-300 flex items-center justify-center text-red-600 shadow-inner">
            <QrCode className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-[#0f2b48]">
              Acceso Rápido por Código QR
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Escanea los códigos QR ubicados en los pasillos de <strong className="text-slate-800">{branchName}</strong> para verificar precios actualizados en USD y Bsd al instante.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5 text-left">
            <Smartphone className="w-5 h-5 text-[#0f2b48] shrink-0" />
            <span>Módulo de escáner con cámara física en preparación para el lanzamiento de tienda.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#0f2b48] hover:bg-[#163b61] active:bg-[#0a1e33] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Entendido, volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
