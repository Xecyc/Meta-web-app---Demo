import React, { useState } from 'react';
import { Hash, X } from 'lucide-react';

interface ScannerManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export const ScannerManualInputModal: React.FC<ScannerManualInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    onSubmit(manualCodeInput.trim());
    setManualCodeInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Ingreso Manual de Código</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Código de Barras o SKU (ej. 7591012001018):
            </label>
            <input
              id="scanner-manual-code-input"
              type="text"
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value)}
              placeholder="Escribe el código numérico..."
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:border-red-600 focus:outline-none bg-slate-50"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!manualCodeInput.trim()}
              className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-md cursor-pointer"
            >
              Consultar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
