import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  ShoppingCart, 
  X,
  ScanLine
} from 'lucide-react';
import { MetaLogo } from './MetaLogo';
import { Branch, CategoryType } from '../types';
import { BRANCHES } from '../data/products';
import { resolveScannerHandler } from '../utils/handlers';

interface NavbarProps {
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartItemCount: number;
  cartTotalUSD: number;
  onOpenCart: () => void;
  onOpenQR?: () => void;
  onOpenScanner?: () => void;
  exchangeRate: number;
  onLogoClick?: () => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  selectedCategory?: CategoryType;
  onSelectCategory?: (category: CategoryType) => void;
  onlyOffers?: boolean;
  onToggleOffers?: () => void;
  onOpenProfile?: () => void;
  productCounts?: Record<string, number>;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedBranch,
  onSelectBranch,
  searchQuery,
  onSearchChange,
  cartItemCount,
  cartTotalUSD,
  onOpenCart,
  onOpenQR,
  onOpenScanner,
  exchangeRate,
  onLogoClick,
}) => {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenScanner = resolveScannerHandler(onOpenScanner, onOpenQR);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header id="main-supermarket-header" className="sticky top-0 z-30 w-full bg-[#c8102e] text-white shadow-lg border-b border-red-800/40">
      {/* Main Header Bar (Logo integrated on Red Header, Search Bar, Sede Selector, Cart Drawer) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo integrated naturally without nested red box */}
          <MetaLogo onClick={onLogoClick} transparentBackground size="header" showSubtitle />

          {/* Central Search Bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-2xl lg:max-w-3xl relative mx-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="desktop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar productos (ej. Harina Pan, Café Fama de América, Queso, Polar)..."
                className="w-full pl-10 pr-28 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-xl border border-transparent focus:border-red-500 focus:bg-white focus:outline-none shadow-md transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    aria-label="Limpiar búsqueda"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  id="desktop-header-scanner-btn"
                  type="button"
                  onClick={handleOpenScanner}
                  title="Abrir Escáner de Código de Barras y Precios"
                  className="px-2 py-1 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 hover:text-red-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-red-200/80 shadow-2xs"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Escanear</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Branch Selector Dropdown */}
            <div className="relative" ref={branchDropdownRef}>
              <button
                id="branch-selector-btn"
                type="button"
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-white/30 text-xs font-bold text-slate-900 shadow-sm transition-all text-left"
              >
                <MapPin className="w-4 h-4 text-[#c8102e] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-semibold leading-none">Sede</span>
                  <span className="text-xs font-extrabold truncate max-w-[125px] sm:max-w-[160px] md:max-w-[180px] text-slate-900">
                    {selectedBranch.shortName}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {showBranchDropdown && (
                <div
                  id="branch-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-900"
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Seleccionar Sucursal
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      {BRANCHES.length} Sedes
                    </span>
                  </div>
                  {BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBranch(b);
                        setShowBranchDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex flex-col hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                        selectedBranch.id === b.id
                          ? 'bg-red-50/80 border-l-4 border-l-red-600 text-red-800 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">{b.name}</span>
                        {selectedBranch.id === b.id && (
                          <span className="text-[10px] text-red-600 font-bold">Activa</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {b.address}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Cart Button (Visible on md+ screens only) */}
            <button
              id="desktop-cart-btn"
              onClick={onOpenCart}
              className="hidden md:flex relative items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-red-700 text-xs font-black shadow-md transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-red-600" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-500 font-bold">Carrito</span>
                <span className="font-black text-xs text-slate-900">
                  ${cartTotalUSD.toFixed(2)}
                </span>
              </div>

              {/* Badge Counter */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#0f2b48] text-white text-[11px] font-black flex items-center justify-center shadow-md">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sticky Search Bar */}
        <div className="mt-2 md:hidden">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos en SuperTienda..."
              className="w-full pl-9 pr-16 py-1.5 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-700 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <button
                id="mobile-header-scanner-btn"
                type="button"
                onClick={handleOpenScanner}
                title="Abrir Escáner de Código de Barras"
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
