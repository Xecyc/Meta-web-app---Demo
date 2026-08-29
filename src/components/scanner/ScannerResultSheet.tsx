import React, { useState } from 'react';
import { 
  CheckCircle, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronRight, 
  Search 
} from 'lucide-react';
import { Product } from '../../types';
import { ScanResult } from './types';

interface ScannerResultSheetProps {
  detectedResult: ScanResult;
  exchangeRate: number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onProductSelect?: (product: Product) => void;
  onSearchProduct?: (query: string) => void;
  onResumeScan: () => void;
  onClose: () => void;
}

export const ScannerResultSheet: React.FC<ScannerResultSheetProps> = ({
  detectedResult,
  exchangeRate,
  onAddToCart,
  onProductSelect,
  onSearchProduct,
  onResumeScan,
  onClose,
}) => {
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  // Quick Action: Add to Cart from Detected Sheet
  const handleConfirmAddToCart = () => {
    if (!detectedResult?.matchedProduct) return;
    onAddToCart(detectedResult.matchedProduct, addQuantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1800);
  };

  // Quick Action: Search with detected Code
  const handleSearchWithCode = () => {
    const query = detectedResult.matchedProduct 
      ? detectedResult.matchedProduct.name 
      : detectedResult.rawCode;
    if (onSearchProduct) {
      onSearchProduct(query);
    }
    onClose();
  };

  return (
    <div 
      id="scanner-result-sheet"
      className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-4 sm:p-6 text-slate-900 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              {detectedResult.matchedProduct ? 'Producto Encontrado' : 'Lectura Capturada'}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-500 font-mono">
              {detectedResult.type === 'barcode' ? 'Código de Barras' : 'OCR / Número'}: {detectedResult.rawCode}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResumeScan}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Escanear Otro
        </button>
      </div>

      {/* Product Card if Matched */}
      {detectedResult.matchedProduct ? (
        <div className="py-3.5 space-y-3.5">
          <div className="flex gap-3.5 items-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
              <img
                src={detectedResult.matchedProduct.image}
                alt={detectedResult.matchedProduct.name}
                className="w-full h-full object-cover"
              />
              {detectedResult.matchedProduct.discountPercent && (
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                  -{detectedResult.matchedProduct.discountPercent}%
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  {detectedResult.matchedProduct.category}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold truncate">
                  {detectedResult.matchedProduct.brand}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 mt-1 leading-snug">
                {detectedResult.matchedProduct.name}
              </h3>

              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <span>{detectedResult.matchedProduct.unit}</span>
                <span>•</span>
                <span className="text-slate-600 font-medium truncate">Pasillo {detectedResult.matchedProduct.aisle}</span>
              </div>

              {/* Pricing block in USD and Bs. */}
              <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-black text-[#0f2b48]">
                  ${detectedResult.matchedProduct.priceUSD.toFixed(2)} USD
                </span>
                <span className="text-xs font-extrabold text-red-600">
                  Bs. {(detectedResult.matchedProduct.priceUSD * exchangeRate).toFixed(2)} Bsd
                </span>
                {detectedResult.matchedProduct.originalPriceUSD && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ${detectedResult.matchedProduct.originalPriceUSD.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Stepper & Add to Cart Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {/* Stepper */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setAddQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-black active:scale-95 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-black text-sm text-slate-900">
                {addQuantity}
              </span>
              <button
                type="button"
                onClick={() => setAddQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-black active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Add to Cart Button */}
            {detectedResult.matchedProduct.inStock === false || detectedResult.matchedProduct.stockCount <= 0 ? (
              <button
                type="button"
                disabled
                className="flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 bg-slate-200 text-slate-500 cursor-not-allowed shadow-none select-none"
              >
                <span>Producto Agotado</span>
              </button>
            ) : (
              <button
                id="scanner-add-to-cart-btn"
                type="button"
                onClick={handleConfirmAddToCart}
                className={`flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                  addedFeedback
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>¡Añadido al Carrito! ({addQuantity})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Añadir al Carrito • ${(detectedResult.matchedProduct.priceUSD * addQuantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2 pt-1">
            {onProductSelect && (
              <button
                type="button"
                onClick={() => {
                  onProductSelect(detectedResult.matchedProduct!);
                  onClose();
                }}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver Ficha Completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearchWithCode}
              className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar en Catálogo</span>
            </button>
          </div>
        </div>
      ) : (
        /* Unmatched Code / Extracted Number Case */
        <div className="py-4 space-y-4 text-center sm:text-left">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-600">
              Código detectado: <strong className="font-mono text-slate-900">{detectedResult.rawCode}</strong>
            </p>
            {detectedResult.extractedPrice && (
              <div className="mt-2 text-xs text-slate-700">
                Valor estimado extraído: <strong className="text-emerald-600 font-extrabold">${detectedResult.extractedPrice.toFixed(2)}</strong> (≈ Bs. {(detectedResult.extractedPrice * exchangeRate).toFixed(2)})
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Este código no coincide exactamente con un producto registrado en nuestra base de datos. Puedes buscarlo por nombre o consultar con un asesor.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSearchWithCode}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Buscar en Catálogo</span>
            </button>
            <button
              type="button"
              onClick={onResumeScan}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Escanear de Nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
