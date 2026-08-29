import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus,
  Share2,
  Sparkles,
  Barcode
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  exchangeRate: number;
  cartQuantity: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

// Format Venezuelan currency: periods for thousands, comma for decimals
const formatVeCurrency = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '0,00';
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedInt},${decPart || '00'}`;
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  exchangeRate,
  onAddToCart,
}) => {
  const [qty, setQty] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Reset quantity to 1 when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setCopied(false);
    }
  }, [isOpen, product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const priceBsd = product.priceUSD * exchangeRate;

  const handleAdd = () => {
    onAddToCart(product, qty);
    onClose();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${product.name} - $${product.priceUSD.toFixed(2)} USD en Supertiendas Meta`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="product-detail-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="product-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn"
      >
        {/* Top Header Bar: Category • Brand | Share & Close */}
        <div className="bg-[#0a192f] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wide shrink-0">
              {product.category}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-300 truncate">
              {product.brand}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="share-product-btn"
              onClick={handleShare}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Compartir producto"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="close-product-detail-btn"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copied && (
          <div className="bg-emerald-600 text-white text-[11px] text-center py-1 font-bold animate-fadeIn">
            ¡Información copiada al portapapeles!
          </div>
        )}

        {/* Upper Content Row: Horizontal Flex / Split View */}
        <div className="p-3.5 sm:p-4 flex flex-row items-center gap-3 sm:gap-4 bg-white">
          {/* Image Frame (Left ~40%): Square thumbnail with discount badge */}
          <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 aspect-square bg-slate-50 rounded-xl p-2 border border-slate-200/90 flex items-center justify-center">
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                -{product.discountPercent}%
              </span>
            ) : product.isFeatured ? (
              <span className="absolute top-1 left-1 bg-[#0a192f] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                TOP
              </span>
            ) : null}

            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Product Information (Right ~60%) */}
          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
            {/* Brand, Packaging & Barcode pill tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-full">
                {product.brand} • {product.unit}
              </span>
              {product.barcode && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded-md">
                  <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{product.barcode}</span>
                </span>
              )}
            </div>

            {/* Product Title in bold font */}
            <h2
              id="product-detail-title"
              className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-2"
              title={product.name}
            >
              {product.name}
            </h2>

            {/* Compact Price Block */}
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[#0a192f] leading-none">
                  ${product.priceUSD.toFixed(2)} USD
                </span>
                {product.originalPriceUSD && (
                  <span className="text-xs text-slate-400 line-through font-medium leading-none">
                    ${product.originalPriceUSD.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-xs font-extrabold text-red-600 mt-1">
                Bs. {formatVeCurrency(priceBsd)} Bsd
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Bar: Stepper + Primary Add CTA */}
        <div className="px-3.5 sm:px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2.5">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5 shrink-0 shadow-2xs">
            <button
              type="button"
              id="decrease-qty-btn"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              disabled={qty <= 1}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-red-600 disabled:text-slate-300 font-bold bg-slate-50 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-black text-slate-900 select-none">
              {qty}
            </span>
            <button
              type="button"
              id="increase-qty-btn"
              onClick={() => setQty((prev) => prev + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-emerald-600 font-bold bg-slate-50 hover:bg-white rounded-lg transition-colors cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            id="modal-add-to-cart-btn"
            onClick={handleAdd}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Añadir ${(product.priceUSD * qty).toFixed(2)} USD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
