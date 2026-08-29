import React from 'react';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Coffee, 
  Sparkles, 
  ShieldCheck, 
  Cookie, 
  Apple, 
  LayoutGrid
} from 'lucide-react';

export const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'Todos':
      return <LayoutGrid className="w-3.5 h-3.5" />;
    case 'Víveres':
      return <UtensilsCrossed className="w-3.5 h-3.5" />;
    case 'Bebidas':
      return <Coffee className="w-3.5 h-3.5" />;
    case 'Charcutería':
      return <ShoppingBag className="w-3.5 h-3.5" />;
    case 'Limpieza':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'Farmacia':
      return <ShieldCheck className="w-3.5 h-3.5" />;
    case 'Snacks':
      return <Cookie className="w-3.5 h-3.5" />;
    case 'Frutas y Verduras':
      return <Apple className="w-3.5 h-3.5" />;
    default:
      return <ShoppingBag className="w-3.5 h-3.5" />;
  }
};
