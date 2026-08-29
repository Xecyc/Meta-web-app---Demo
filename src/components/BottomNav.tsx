import React from 'react';
import { Home, Search, ShoppingCart, User, ScanLine } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenQR: () => void;
  onOpenScanner?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartItemCount,
  onOpenCart,
  onOpenQR,
  onOpenScanner,
}) => {
  const handleOpenScanner = () => {
    if (onOpenScanner) {
      onOpenScanner();
    } else {
      onOpenQR();
    }
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* Tab 1: Inicio */}
        <button
          id="nav-tab-inicio"
          onClick={() => onTabChange('inicio')}
          className={`flex flex-col items-center justify-center relative transition-colors py-1 ${
            activeTab === 'inicio' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Inicio</span>
          {activeTab === 'inicio' && (
            <span className="absolute top-0 w-8 h-0.5 bg-red-600 rounded-b-full"></span>
          )}
        </button>

        {/* Tab 2: Productos / Buscar */}
        <button
          id="nav-tab-productos"
          onClick={() => onTabChange('productos')}
          className={`flex flex-col items-center justify-center relative transition-colors py-1 ${
            activeTab === 'productos' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Productos</span>
          {activeTab === 'productos' && (
            <span className="absolute top-0 w-8 h-0.5 bg-red-600 rounded-b-full"></span>
          )}
        </button>

        {/* Tab 3 / CENTER: Refined Red Circle Scanner Button */}
        <div className="flex flex-col items-center justify-center -mt-2.5">
          <button
            id="mobile-qr-center-btn"
            onClick={handleOpenScanner}
            aria-label="Escanear Código de Barras o Precios"
            className="w-[46px] h-[46px] rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/30 border-2 border-white transition-all focus:outline-none cursor-pointer"
          >
            <ScanLine className="w-5 h-5 stroke-[2.4] animate-pulse" />
          </button>
          <span className="text-[9px] font-extrabold text-red-600 mt-0.5 tracking-tight uppercase">
            Escanear
          </span>
        </div>

        {/* Tab 4: Carrito with Badge */}
        <button
          id="nav-tab-carrito"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center relative text-slate-500 hover:text-slate-800 transition-colors py-1"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none">Carrito</span>
        </button>

        {/* Tab 5: Cuenta / Config */}
        <button
          id="nav-tab-cuenta"
          onClick={() => onTabChange('cuenta')}
          className={`flex flex-col items-center justify-center relative transition-colors py-1 ${
            activeTab === 'cuenta' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Cuenta</span>
          {activeTab === 'cuenta' && (
            <span className="absolute top-0 w-8 h-0.5 bg-red-600 rounded-b-full"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
