import React, { useState } from 'react';
import { Plus, Minus, Check, Info, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
  cartQuantity: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  exchangeRate,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetails,
}) => {
  const [localQty, setLocalQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imgError, setImgError] = useState(false);

  const priceBsd = product.priceUSD * exchangeRate;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, localQty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1000);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      onUpdateQuantity(product.id, cartQuantity + 1);
    } else {
      setLocalQty((prev) => prev + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      onUpdateQuantity(product.id, Math.max(0, cartQuantity - 1));
    } else {
      setLocalQty((prev) => Math.max(1, prev - 1));
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden p-3 sm:p-3.5"
    >
      {/* Discount Badge: Consistently aligned top-left */}
      {product.discountPercent && product.discountPercent > 0 ? (
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="bg-red-600 text-white text-[9px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs uppercase tracking-tight">
            -{product.discountPercent}%
          </span>
        </div>
      ) : null}

      {/* Info tooltip / quick view button (8px inset spacing: top-2 right-2) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(product);
        }}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/95 text-slate-400 hover:text-slate-900 shadow-xs sm:opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-110"
        title="Ver detalles del producto"
      >
        <Info className="w-4 h-4" />
      </button>

      {/* Product Thumbnail Container: Uniform square aspect ratio */}
      <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center mb-2.5 p-2 border border-slate-100">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400 bg-slate-100 rounded-lg">
            <ShoppingCart className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 text-center line-clamp-1">
              {product.brand}
            </span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title: 2 lines maximum with leading-snug */}
        <h3
          title={product.name}
          className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug min-h-[2.4rem] mb-1.5 group-hover:text-red-600 transition-colors"
        >
          {product.name}
        </h3>

        {/* Pricing Section */}
        <div className="mt-auto pt-2 pb-2 border-t border-slate-100 flex flex-col gap-1">
          {/* Row 1: Primary USD price + strikethrough original price side-by-side */}
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg lg:text-xl font-black text-[#0f2b48] tracking-tight">
              ${product.priceUSD.toFixed(2)}
            </span>
            {product.originalPriceUSD && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ${product.originalPriceUSD.toFixed(2)}
              </span>
            )}
          </div>

          {/* Row 2: Converted VES price tag in its own dedicated pill badge */}
          <div className="flex items-center">
            <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {priceBsd.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bsd
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls: Full-width red "+ Añadir" CTA button anchored cleanly */}
      <div className="pt-1 mt-auto w-full">
        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-red-50 rounded-xl p-1 border border-red-200 w-full shadow-2xs">
            <button
              id={`decrement-btn-${product.id}`}
              onClick={handleDecrement}
              aria-label="Disminuir cantidad"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-red-700 hover:bg-red-100 shadow-xs active:scale-95 transition-all font-bold shrink-0 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col items-center px-1.5">
              <span className="text-xs sm:text-sm font-black text-red-950">
                {cartQuantity}
              </span>
            </div>
            <button
              id={`increment-btn-${product.id}`}
              onClick={handleIncrement}
              aria-label="Aumentar cantidad"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-xs active:scale-95 transition-all font-bold shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            id={`add-btn-${product.id}`}
            onClick={handleAdd}
            className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer ${
              addedFeedback
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>Añadir</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
