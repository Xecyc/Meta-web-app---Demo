import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  ArrowRight
} from 'lucide-react';
import { CartItem, CustomerProfile, Branch } from '../types';
import { formatVeCurrency } from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  exchangeRate: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  customerProfile?: CustomerProfile;
  selectedBranch: Branch;
  onOpenCustomerModal?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  exchangeRate,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedBranch,
}) => {
  if (!isOpen) return null;

  const totalUSD = items.reduce((acc, item) => acc + item.product.priceUSD * item.quantity, 0);
  const totalBsd = totalUSD * exchangeRate;
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSendWhatsApp = () => {
    if (items.length === 0) return;

    const orderNumber = `META-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let message = `🛒 *PEDIDO SUPERTIENDAS META - #${orderNumber}*\n`;
    message += `📅 *Fecha:* ${dateStr}\n`;
    message += `📍 *Sede:* ${selectedBranch.name}\n\n`;

    message += `📦 *DETALLE DE PRODUCTOS (${totalItemCount} ${totalItemCount === 1 ? 'artículo' : 'artículos'}):*\n`;
    items.forEach((item, index) => {
      const itemTotalUSD = item.product.priceUSD * item.quantity;
      const itemTotalBsd = itemTotalUSD * exchangeRate;
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   ${item.quantity} x $${item.product.priceUSD.toFixed(2)} USD = *$${itemTotalUSD.toFixed(2)} USD* (Bs. ${formatVeCurrency(itemTotalBsd)})\n`;
    });

    message += `\n💰 *TOTAL A PAGAR:*\n`;
    message += `👉 *$${totalUSD.toFixed(2)} USD*\n`;
    message += `👉 *Bs. ${formatVeCurrency(totalBsd)}*\n`;
    message += `_(Tasa BCV oficial: $1 = ${formatVeCurrency(exchangeRate)} Bsd)_\n\n`;

    message += `👤 *POR FAVOR CONFIRMAR:*\n`;
    message += `• *Nombre y Apellido:* \n`;
    message += `• *Cédula / RIF:* \n`;
    message += `• *Modalidad:* [ ] Retiro en Tienda  [ ] Delivery\n`;
    message += `• *Dirección de entrega (si aplica):* \n`;
    message += `• *Método de pago:* [ ] Pago Móvil  [ ] Zelle  [ ] Punto  [ ] Efectivo\n\n`;
    message += `¡Gracias por elegir Supertiendas Meta! 🛒✨`;

    const encodedMessage = encodeURIComponent(message);
    const targetPhone = selectedBranch.whatsappNumber || '584246398347';
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full min-h-screen sm:min-h-0 sm:w-96 sm:max-w-md bg-white shadow-2xl flex flex-col justify-between transition-all duration-300 overflow-hidden"
      >
          {/* 1. Header: Title + Dynamic item count + Vaciar todo & Close */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0a1e33] to-[#0f2b48] text-white flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold font-heading truncate">
                  Cesta de Compras
                </h2>
                <p className="text-xs text-slate-300">
                  {totalItemCount} {totalItemCount === 1 ? 'artículo agregado' : 'artículos agregados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {items.length > 0 && (
                <button
                  id="btn-clear-cart"
                  onClick={onClearCart}
                  className="px-2.5 py-1.5 text-slate-300 hover:text-red-400 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Vaciar Carrito"
                >
                  Vaciar todo
                </button>
              )}
              <button
                id="btn-close-cart"
                onClick={onClose}
                aria-label="Cerrar cesta"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Main Scrollable Body: Dedicated 100% to displaying list of items */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3 shadow-inner">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1 font-heading">
                Tu cesta de compras está vacía
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">
                Agrega víveres, bebidas, charcutería y ofertas a tu pedido para enviarlo directamente a WhatsApp.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#0f2b48] hover:bg-[#163b61] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-2.5 divide-y divide-slate-100">
              {items.map((item) => {
                const itemTotalUSD = item.product.priceUSD * item.quantity;
                const itemTotalBsd = itemTotalUSD * exchangeRate;

                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="pt-2.5 first:pt-0 flex items-center gap-3 group hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                  >
                    {/* Product image thumbnail (Left) */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Title & unit price in USD/Bsd (Center) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded truncate">
                          {item.product.brand}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ${item.product.priceUSD.toFixed(2)} USD • <span className="text-slate-400">{item.product.unit}</span>
                      </p>

                      {/* Line Subtotal */}
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-[#0a192f]">
                          ${itemTotalUSD.toFixed(2)} USD
                        </span>
                        <span className="text-[10px] font-bold text-red-600">
                          (Bs. {formatVeCurrency(itemTotalBsd)})
                        </span>
                      </div>
                    </div>

                    {/* Quantity stepper & Trash delete icon (Right) */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-red-600 rounded bg-white font-bold cursor-pointer transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-[#0a192f]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-emerald-600 rounded bg-white font-bold cursor-pointer transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Compact Sticky Footer: Price Summary + WhatsApp CTA */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-3 shadow-lg">
              {/* Subtotal & Final Total grouped cleanly */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Total a pagar:
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Subtotal: ${totalUSD.toFixed(2)} USD
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-[#0a192f] font-heading leading-none">
                    ${totalUSD.toFixed(2)} USD
                  </div>
                  <div className="text-xs font-extrabold text-red-600 mt-1">
                    Bs. {formatVeCurrency(totalBsd)}
                  </div>
                </div>
              </div>

              {/* Primary Action Button (WhatsApp CTA) */}
              <div>
                <button
                  id="btn-whatsapp-checkout"
                  onClick={handleSendWhatsApp}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ENVIAR PEDIDO A WHATSAPP</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
                  Te responderemos al instante para confirmar tu compra.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
