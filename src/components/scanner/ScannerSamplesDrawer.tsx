import React from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface ScannerSamplesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectSample: (product: Product) => void;
}

export const ScannerSamplesDrawer: React.FC<ScannerSamplesDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl max-h-[80vh] flex flex-col text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900">Probar Códigos de Muestra</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 my-2">
          Haz clic en cualquier producto para simular la captura inmediata del código de barras en el escáner:
        </p>

        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
          {products.slice(0, 8).map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => {
                onSelectSample(prod);
                onClose();
              }}
              className="w-full text-left p-2 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors group cursor-pointer"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-red-600">
                  {prod.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{prod.barcode}</span>
                  <span>•</span>
                  <strong className="text-slate-700">${prod.priceUSD.toFixed(2)}</strong>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
