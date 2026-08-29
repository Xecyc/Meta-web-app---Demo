import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowUpDown, 
  Calculator, 
  DollarSign, 
  Coins 
} from 'lucide-react';
import { formatVeCurrency, parseVeCurrency, formatLiveInput } from '../utils/currency';

export { formatVeCurrency, parseVeCurrency, formatLiveInput };

interface BcvCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeRate: number;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export const BcvCalculatorModal: React.FC<BcvCalculatorModalProps> = ({
  isOpen,
  onClose,
  exchangeRate,
}) => {
  // Mode: 'USD_TO_BSD' means top is USD, bottom is Bsd. 'BSD_TO_USD' means top is Bsd, bottom is USD.
  const [mode, setMode] = useState<'USD_TO_BSD' | 'BSD_TO_USD'>('USD_TO_BSD');
  const [usdInput, setUsdInput] = useState<string>('1,00');
  const [bsdInput, setBsdInput] = useState<string>(() => formatVeCurrency(1 * exchangeRate));

  // Synchronize initial rate
  useEffect(() => {
    if (isOpen) {
      const initialUsd = 1.0;
      setUsdInput('1,00');
      setBsdInput(formatVeCurrency(initialUsd * exchangeRate));
    }
  }, [isOpen, exchangeRate]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle USD input change
  const handleUsdChange = (rawVal: string) => {
    const formatted = formatLiveInput(rawVal);
    setUsdInput(formatted);

    const numeric = parseVeCurrency(formatted);
    if (numeric > 0 && exchangeRate > 0) {
      setBsdInput(formatVeCurrency(numeric * exchangeRate));
    } else if (!formatted || formatted === '0' || formatted === '0,') {
      setBsdInput('');
    } else {
      setBsdInput('0,00');
    }
  };

  // Handle Bsd input change
  const handleBsdChange = (rawVal: string) => {
    const formatted = formatLiveInput(rawVal);
    setBsdInput(formatted);

    const numeric = parseVeCurrency(formatted);
    if (numeric > 0 && exchangeRate > 0) {
      setUsdInput(formatVeCurrency(numeric / exchangeRate));
    } else if (!formatted || formatted === '0' || formatted === '0,') {
      setUsdInput('');
    } else {
      setUsdInput('0,00');
    }
  };

  // Toggle conversion direction
  const handleToggleMode = () => {
    setMode((prev) => (prev === 'USD_TO_BSD' ? 'BSD_TO_USD' : 'USD_TO_BSD'));
  };

  // Select Preset Amount in USD
  const handleSelectPreset = (amount: number) => {
    setUsdInput(formatVeCurrency(amount));
    setBsdInput(formatVeCurrency(amount * exchangeRate));
  };

  // Formatted BCV reference rate
  const formattedRate = formatVeCurrency(exchangeRate);
  const currentUsdNumeric = parseVeCurrency(usdInput);

  // Render Cards helper
  const renderUsdCard = (isPrimary: boolean) => (
    <div
      className={`rounded-xl p-3 border-2 transition-all shadow-2xs ${
        isPrimary
          ? 'bg-slate-50 border-slate-200 focus-within:border-[#0f2b48] focus-within:bg-white'
          : 'bg-slate-50/80 border-slate-200 focus-within:border-[#0f2b48] focus-within:bg-white'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          Dólares (USD)
        </span>
        <span className="bg-slate-200/90 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide">
          USD
        </span>
      </div>
      <div className="flex items-center">
        <span className="text-xl sm:text-2xl font-bold text-slate-400 mr-1 select-none">
          $
        </span>
        <input
          id="calculator-usd-input"
          type="text"
          inputMode="decimal"
          value={usdInput}
          onChange={(e) => handleUsdChange(e.target.value)}
          placeholder="0,00"
          className="w-full bg-transparent text-xl sm:text-2xl font-bold text-slate-900 focus:outline-none tracking-tight"
        />
      </div>
    </div>
  );

  const renderBsdCard = (isPrimary: boolean) => (
    <div
      className={`rounded-xl p-3 border-2 transition-all shadow-2xs ${
        isPrimary
          ? 'bg-amber-50/70 border-amber-200/90 focus-within:border-amber-500 focus-within:bg-white'
          : 'bg-amber-50/50 border-amber-200/70 focus-within:border-amber-500 focus-within:bg-white'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
        <span className="flex items-center gap-1">
          <Coins className="w-3.5 h-3.5 text-amber-600" />
          Bolívares (Bsd)
        </span>
        <span className="bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide">
          Bsd
        </span>
      </div>
      <div className="flex items-center">
        <input
          id="calculator-bsd-input"
          type="text"
          inputMode="decimal"
          value={bsdInput}
          onChange={(e) => handleBsdChange(e.target.value)}
          placeholder="0,00"
          className="w-full bg-transparent text-xl sm:text-2xl font-bold text-slate-900 focus:outline-none tracking-tight"
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="bcv-calculator-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            id="bcv-calculator-bottom-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bcv-calculator-title"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border-t sm:border border-slate-200 max-h-[90vh] overflow-y-auto overscroll-contain"
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2.5 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0a192f] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Calculator className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2
                    id="bcv-calculator-title"
                    className="text-base sm:text-lg font-black text-slate-900 leading-tight"
                  >
                    Calculadora de Cambio BCV
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Tasa: {formattedRate} Bsd / USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Icon Button */}
              <button
                id="close-bcv-calculator-btn"
                onClick={onClose}
                aria-label="Cerrar calculadora"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Input Converter */}
            <div className="mt-3.5 space-y-2">
              {mode === 'USD_TO_BSD' ? (
                <>
                  {renderUsdCard(true)}
                  {/* Central Toggle Button */}
                  <div className="flex items-center justify-center relative py-0.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <button
                      id="toggle-conversion-direction-btn"
                      type="button"
                      onClick={handleToggleMode}
                      title="Cambiar dirección de conversión"
                      className="relative z-10 p-1.5 rounded-full bg-white hover:bg-slate-100 text-[#0a192f] border-2 border-slate-200 hover:border-slate-300 shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#0a192f]" />
                    </button>
                  </div>
                  {renderBsdCard(false)}
                </>
              ) : (
                <>
                  {renderBsdCard(true)}
                  {/* Central Toggle Button */}
                  <div className="flex items-center justify-center relative py-0.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <button
                      id="toggle-conversion-direction-btn"
                      type="button"
                      onClick={handleToggleMode}
                      title="Cambiar dirección de conversión"
                      className="relative z-10 p-1.5 rounded-full bg-white hover:bg-slate-100 text-[#0a192f] border-2 border-slate-200 hover:border-slate-300 shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#0a192f]" />
                    </button>
                  </div>
                  {renderUsdCard(false)}
                </>
              )}
            </div>

            {/* Quick Amount Shortcuts (Preset Pills) */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">
                  Montos rápidos:
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = Math.abs(currentUsdNumeric - amt) < 0.001;
                  return (
                    <button
                      key={amt}
                      type="button"
                      id={`preset-amount-${amt}`}
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 px-1 text-center font-bold text-xs rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0a192f] text-white border-[#0a192f] shadow-xs scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 active:scale-95'
                      }`}
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-4">
              <button
                type="button"
                id="close-calculator-footer-btn"
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
