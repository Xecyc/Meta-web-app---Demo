import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { CategoryType } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

interface CategoryBarProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  productCounts: Record<string, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  productCounts,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScrollability, 300);
  };

  return (
    <nav
      id="category-navigation-bar"
      aria-label="Categorías de productos"
      className="w-full bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-20"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center">
        {/* Left Scroll Arrow (Mobile only) */}
        <button
          type="button"
          id="cat-scroll-left-btn"
          aria-label="Desplazar categorías hacia la izquierda"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className={`md:hidden shrink-0 z-10 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-red-600 hover:bg-slate-50 active:scale-95 transition-all mr-1.5 flex items-center justify-center ${
            canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Categories Bar: Scrollable on mobile, Full-Width Flex Menu on Desktop */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center md:justify-between gap-1.5 lg:gap-2 overflow-x-auto md:overflow-visible py-2 sm:py-2.5 no-scrollbar scroll-smooth"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const count = productCounts[category] || 0;

            return (
              <button
                key={category}
                id={`cat-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCategory(category)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-xs font-extrabold whitespace-nowrap transition-all duration-150 shrink-0 md:shrink cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs scale-100'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-slate-500'}>
                  {getCategoryIcon(category)}
                </span>
                <span className="font-heading">{category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/90 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow (Mobile only) */}
        <button
          type="button"
          id="cat-scroll-right-btn"
          aria-label="Desplazar categorías hacia la derecha"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className={`md:hidden shrink-0 z-10 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-red-600 hover:bg-slate-50 active:scale-95 transition-all ml-1.5 flex items-center justify-center ${
            canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
