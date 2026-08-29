import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface FeaturedDealsBannerProps {
  featuredProducts: Product[];
  exchangeRate: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenDetails: (product: Product) => void;
}

export const FeaturedDealsBanner: React.FC<FeaturedDealsBannerProps> = ({
  featuredProducts,
  exchangeRate,
  onAddToCart,
  onOpenDetails,
}) => {
  // Extract up to 4 distinct discounted / featured products
  const deals = useMemo(() => {
    const discounted = featuredProducts.filter((p) => (p.discountPercent && p.discountPercent > 0) || p.isFeatured);
    // Ensure we have up to 4 distinct items
    const distinct: Product[] = [];
    const seenIds = new Set<string>();

    for (const item of discounted) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        distinct.push(item);
        if (distinct.length === 4) break;
      }
    }

    // If less than 4, fill with any available products to guarantee 4 items if possible
    if (distinct.length < 4) {
      for (const item of featuredProducts) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          distinct.push(item);
          if (distinct.length === 4) break;
        }
      }
    }

    return distinct.length > 0 ? distinct : featuredProducts.slice(0, 4);
  }, [featuredProducts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = deals.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, 4000);
  }, [totalSlides]);

  // Handle auto-advance interval
  useEffect(() => {
    if (!isPaused && totalSlides > 1) {
      startTimer();
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides, startTimer]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    if (!isPaused) startTimer();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    if (!isPaused) startTimer();
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
    if (!isPaused) startTimer();
  };

  if (!deals || deals.length === 0) return null;

  const currentDeal = deals[currentIndex] || deals[0];
  const dealPriceBsd = currentDeal.priceUSD * exchangeRate;
  const discountLabel = currentDeal.discountPercent ? `-${currentDeal.discountPercent}%` : '-13%';

  return (
    <div id="featured-deals-banner" className="w-full mb-3 sm:mb-4 select-none">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1e33] via-[#0f2b48] to-[#163b61] text-white border border-slate-700/60 shadow-lg px-6 sm:px-10 md:px-12 lg:px-16 pt-3.5 pb-5 sm:py-5 lg:py-6 min-h-[155px] sm:min-h-[185px] lg:min-h-[210px] transition-all duration-300 flex items-center"
      >
        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-1/4 -mt-10 w-60 h-60 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Clean, semi-transparent Left Chevron (no heavy dark circle) */}
        {totalSlides > 1 && (
          <button
            type="button"
            id="carousel-btn-prev"
            onClick={handlePrev}
            aria-label="Oferta anterior"
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 p-1 text-white/70 hover:text-white active:scale-90 transition-all focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Clean, semi-transparent Right Chevron (no heavy dark circle) */}
        {totalSlides > 1 && (
          <button
            type="button"
            id="carousel-btn-next"
            onClick={handleNext}
            aria-label="Siguiente oferta"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 p-1 text-white/70 hover:text-white active:scale-90 transition-all focus:outline-none cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Main Content Area with Smooth Slide Transition & Two-Column Layout */}
        <div
          key={currentDeal.id}
          className="w-full flex flex-row items-center justify-between gap-3 sm:gap-6 lg:gap-10 z-10 animate-fadeIn"
        >
          {/* Left Side: Badges, High-Contrast Typography, Dual Pricing, Excerpt & CTAs */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Top-left Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-[#dc2626] text-white text-[9px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
                <span>OFERTA DE LA SEMANA</span>
              </span>
              <span className="bg-amber-400 text-slate-950 text-[9px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md tracking-tight shadow-2xs">
                {discountLabel}
              </span>
              <span className="hidden sm:inline-block text-[11px] text-slate-300 font-semibold bg-white/10 px-2 py-0.5 rounded">
                {currentDeal.category}
              </span>
            </div>

            {/* Product Title */}
            <h2
              onClick={() => onOpenDetails(currentDeal)}
              className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-white line-clamp-1 sm:line-clamp-2 tracking-tight cursor-pointer hover:text-amber-300 transition-colors leading-tight"
              title={currentDeal.name}
            >
              {currentDeal.name}
            </h2>

            {/* Description Excerpt for wide screens */}
            <p className="hidden md:block text-xs lg:text-sm text-slate-300 line-clamp-1 lg:line-clamp-2 mt-1 mb-1 max-w-xl leading-relaxed">
              {currentDeal.description || `${currentDeal.brand} - Presentación: ${currentDeal.unit}. Disponible en pasillo ${currentDeal.aisle}.`}
            </p>

            {/* Dual Pricing Row */}
            <div className="mt-1 sm:mt-1.5 flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-base sm:text-2xl lg:text-3xl font-black text-amber-400 tracking-tight">
                  ${currentDeal.priceUSD.toFixed(2)}
                </span>
                {currentDeal.originalPriceUSD && (
                  <span className="text-[10px] sm:text-sm lg:text-base text-slate-400 line-through font-medium">
                    ${currentDeal.originalPriceUSD.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-white bg-white/15 border border-white/20 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">
                {dealPriceBsd.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bsd
              </span>
              <span className="hidden lg:inline text-[11px] text-slate-400 font-medium">
                ({currentDeal.unit})
              </span>
            </div>

            {/* CTA Row with Restored "Detalles" Text Link */}
            <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3.5 flex-wrap">
              <button
                id="btn-add-featured-deal"
                type="button"
                onClick={() => onAddToCart(currentDeal, 1)}
                className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#dc2626] hover:bg-red-700 active:bg-red-800 text-white text-[11px] sm:text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Añadir</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenDetails(currentDeal)}
                className="text-[11px] sm:text-xs font-bold text-slate-300 hover:text-white underline underline-offset-2 hover:no-underline cursor-pointer transition-colors px-1 py-1"
              >
                Detalles
              </button>
            </div>
          </div>

          {/* Right Side: Vertically Centered Product Image Frame */}
          <div
            onClick={() => onOpenDetails(currentDeal)}
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-36 lg:w-48 lg:h-44 bg-white/95 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl border border-white/30 flex items-center justify-center shrink-0 my-auto cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <img
              src={currentDeal.image}
              alt={currentDeal.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="max-h-full max-w-full object-contain filter drop-shadow-xs"
            />
          </div>
        </div>

        {/* Minimalist Horizontal Pagination Dots along the bottom with safe margin */}
        {totalSlides > 1 && (
          <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {deals.map((deal, idx) => (
              <button
                key={deal.id || idx}
                type="button"
                onClick={(e) => handleDotClick(idx, e)}
                aria-label={`Ir a oferta ${idx + 1}`}
                className={`transition-all duration-300 focus:outline-none cursor-pointer ${
                  idx === currentIndex
                    ? 'w-3 sm:w-3.5 h-1 sm:h-1.5 rounded-full bg-[#dc2626]'
                    : 'w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
