import React, { useState, useEffect, useMemo } from 'react';
import { 
  SAMPLE_PRODUCTS, 
  BRANCHES, 
  CATEGORIES, 
  INITIAL_EXCHANGE_RATE 
} from './data/products';
import { 
  Product, 
  CartItem, 
  CustomerProfile, 
  Branch, 
  ActiveTab 
} from './types';

import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { ExchangeBanner } from './components/ExchangeBanner';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CustomerModal } from './components/CustomerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QRModal } from './components/QRModal';
import { ScannerModal } from './components/ScannerModal';
import { BottomNav } from './components/BottomNav';
import { AccountView } from './components/AccountView';
import { FeaturedDealsBanner } from './components/FeaturedDealsBanner';
import { BcvCalculatorModal } from './components/BcvCalculatorModal';

import { 
  SlidersHorizontal, 
  Tag, 
  Search
} from 'lucide-react';

const STORAGE_KEYS = {
  CART: 'meta_supermarket_cart',
  PROFILE: 'meta_supermarket_profile',
  BRANCH: 'meta_supermarket_branch',
  RATE: 'meta_supermarket_rate',
};

export default function App() {
  // 1. Core State
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANCH);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = BRANCHES.find((b) => b.id === parsed.id);
        if (match) return match;
      }
    } catch (e) {
      console.error(e);
    }
    return BRANCHES[0];
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATE);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXCHANGE_RATE;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      documentType: 'V',
      documentNumber: '',
      fullName: '',
      phone: '',
      email: '',
      address: '',
      preferredBranch: BRANCHES[0].id,
    };
  });

  // 2. Navigation and Filter State
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);

  // 3. Modals and Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Lock background window scroll whenever any modal or drawer is open
  const isAnyModalOpen = isCartOpen || isCustomerModalOpen || isScannerOpen || isCalculatorOpen || Boolean(detailProduct);

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isAnyModalOpen]);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save Branch to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANCH, JSON.stringify(selectedBranch));
    } catch (e) {
      console.error(e);
    }
  }, [selectedBranch]);

  // Save Rate to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RATE, exchangeRate.toString());
    } catch (e) {
      console.error(e);
    }
  }, [exchangeRate]);

  // Save Profile Handler
  const handleSaveProfile = (profile: CustomerProfile) => {
    setCustomerProfile(profile);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Product Counts per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: products.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'Todos') {
        counts[cat] = products.filter((p) => p.category === cat).length;
      }
    });
    return counts;
  }, [products]);

  // Cart Map for fast lookup
  const cartQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  const totalCartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalCartUSD = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.priceUSD * item.quantity, 0),
    [cart]
  );

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'Todos' && product.category !== selectedCategory) {
        return false;
      }
      // Offers filter
      if (onlyOffers && !product.discountPercent) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesAisle = product.aisle.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCat && !matchesAisle) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
      if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, onlyOffers, searchQuery, sortBy]);

  const featuredList = useMemo(
    () => products.filter((p) => p.isFeatured || p.discountPercent),
    [products]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24 md:pb-8">
      {/* 1. Header Navigation Bar */}
      <Navbar
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && activeTab !== 'productos') {
            setActiveTab('productos');
          }
        }}
        cartItemCount={totalCartCount}
        cartTotalUSD={totalCartUSD}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQR={() => setIsScannerOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        exchangeRate={exchangeRate}
        onLogoClick={() => {
          setActiveTab('inicio');
          setSelectedCategory('Todos');
          setSearchQuery('');
          setOnlyOffers(false);
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeTab === 'inicio' && cat !== 'Todos') {
            setActiveTab('productos');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onlyOffers={onlyOffers}
        onToggleOffers={() => {
          setOnlyOffers(!onlyOffers);
          if (!onlyOffers && activeTab !== 'productos') {
            setActiveTab('productos');
          }
        }}
        onOpenProfile={() => {
          setActiveTab('cuenta');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        productCounts={productCounts}
      />

      {/* 2. Slim Live Exchange Rate Banner (Directly below search bar / header) */}
      {activeTab !== 'cuenta' && (
        <ExchangeBanner
          exchangeRate={exchangeRate}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />
      )}

      {/* 3. Category Bar (Directly below the rate banner) */}
      {activeTab !== 'cuenta' && (
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (activeTab === 'inicio' && cat !== 'Todos') {
              setActiveTab('productos');
            }
          }}
          productCounts={productCounts}
        />
      )}

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3">
        {/* VIEW A: CUENTA / CONFIG VIEW */}
        {activeTab === 'cuenta' ? (
          <AccountView
            profile={customerProfile}
            onEditProfile={() => setIsCustomerModalOpen(true)}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            exchangeRate={exchangeRate}
          />
        ) : (
          <>
            {/* Featured Deals Hero (Only on Inicio tab when not actively searching) */}
            {activeTab === 'inicio' && !searchQuery && selectedCategory === 'Todos' && (
              <FeaturedDealsBanner
                featuredProducts={featuredList}
                exchangeRate={exchangeRate}
                onAddToCart={handleAddToCart}
                onOpenDetails={setDetailProduct}
              />
            )}

            {/* Catalog Filter Controls & Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  {searchQuery
                    ? `Resultados para "${searchQuery}"`
                    : selectedCategory === 'Todos'
                    ? 'Productos Destacados'
                    : selectedCategory}
                </h1>
                <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {/* Filters and Sort */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Only Offers Toggle */}
                <button
                  id="filter-offers-btn"
                  onClick={() => setOnlyOffers(!onlyOffers)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    onlyOffers
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Solo Ofertas</span>
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    id="sort-by-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="featured">Destacados</option>
                    <option value="price-asc">Menor Precio ($)</option>
                    <option value="price-desc">Mayor Precio ($)</option>
                    <option value="name">Alfabético (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PRODUCT GRID (2 columns on mobile, 4 to 5 columns on desktop) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm my-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No se encontraron productos
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Intenta buscar con otros términos o cambia la categoría seleccionada.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                    setOnlyOffers(false);
                  }}
                  className="px-4 py-2 bg-[#0f2b48] hover:bg-[#163b61] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div
                id="products-grid"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    exchangeRate={exchangeRate}
                    cartQuantity={cartQuantityMap[product.id] || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onOpenDetails={setDetailProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. Footer Information & Reassurance */}
      <footer className="mt-auto bg-[#0f2b48] text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
          <div>
            <span className="font-heading font-black text-white text-base tracking-wider block mb-2">
              SUPERTIENDAS META
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
              Tu supermercado de confianza en Maracaibo y San Francisco. Calidad garantizada en víveres, charcutería y farmacia.
            </p>
          </div>

          <div className="space-y-1 text-[11px] sm:text-right">
            <p className="text-white font-semibold">{selectedBranch.name}</p>
            <p className="text-slate-400">{selectedBranch.address}</p>
            <p className="text-emerald-400 font-bold">{selectedBranch.hours}</p>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQR={() => setIsScannerOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* 6. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        exchangeRate={exchangeRate}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        customerProfile={customerProfile}
        selectedBranch={selectedBranch}
        onOpenCustomerModal={() => {
          setIsCustomerModalOpen(true);
        }}
      />

      {/* 7. Customer Profile Registration Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        profile={customerProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* 8. Product Details Quick View Modal */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        exchangeRate={exchangeRate}
        cartQuantity={detailProduct ? cartQuantityMap[detailProduct.id] || 0 : 0}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* 9. Mobile Camera Scanner Modal (Dual Barcode + OCR Engine) */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        exchangeRate={exchangeRate}
        onAddToCart={handleAddToCart}
        onProductSelect={(prod) => setDetailProduct(prod)}
        onSearchProduct={(q) => {
          setSearchQuery(q);
          setActiveTab('productos');
        }}
        branchName={selectedBranch.name}
      />

      {/* 10. BCV Currency Converter Bottom Sheet Modal */}
      <BcvCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        exchangeRate={exchangeRate}
      />
    </div>
  );
}
